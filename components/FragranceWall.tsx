"use client";

/* eslint-disable @next/next/no-img-element -- bottles are absolutely positioned inside fixed shelf boxes */
import { useCallback, useEffect, useRef, useState } from "react";
import { PRODUCTS, SIZES, priceFor, taka, photo, type Size } from "@/lib/products";

type CartItem = { id: string; size: Size };
type Measured = { wx: number; wy: number; items: { x: number; y: number; w: number; h: number }[] };

const CART_KEY = "lumera-cart-v1";
const count = PRODUCTS.length;
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function FragranceWall() {
  const wallRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cacheRef = useRef<Measured | null>(null);

  const [zoomed, setZoomed] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [transform, setTransform] = useState<string>("");
  const [instant, setInstant] = useState(false);
  const [size, setSize] = useState<Size>(100);
  const [note, setNote] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // Cart lives in this browser only; read it after mount so server and client render the same
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
    } catch {
      setCart([]);
    }
  }, []);
  const saveCart = (next: CartItem[]) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {}
  };

  const toast = (msg: string) => {
    setToastMsg(msg);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 2200);
  };

  // Camera zoom: move and scale the whole wall so the chosen bottle fills the screen.
  // Positions are measured once at scale 1; scrolling is locked while zoomed so they stay valid.
  const measure = () => {
    const wall = wallRef.current!;
    const w = wall.getBoundingClientRect();
    cacheRef.current = {
      wx: w.left,
      wy: w.top,
      items: slotRefs.current.map((sl) => {
        // Fall back to the shelf space if a photo has not finished loading yet
        let r = sl!.querySelector(".bottle")!.getBoundingClientRect();
        if (!r.width || !r.height) r = sl!.querySelector(".stage")!.getBoundingClientRect();
        return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2, w: r.width, h: r.height };
      }),
    };
  };

  const zoomTo = useCallback(
    (i: number, remeasure = false) => {
      if (!zoomed || remeasure) measure();
      const idx = (i + count) % count;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const phone = vw < 760;
      const target = phone
        ? { x: vw / 2, y: vh * 0.36, w: vw * 0.9 }
        : { x: vw * 0.46, y: vh * 0.5, w: Math.min(vw * 0.5, vh * 1.1, 820) };
      const it = cacheRef.current!.items[idx];
      const s = Math.min(target.w / it.w, (phone ? vh * 0.34 : vh * 0.6) / it.h);
      const tx = target.x - cacheRef.current!.wx - s * it.x;
      const ty = target.y - cacheRef.current!.wy - s * it.y;
      setTransform(`translate(${tx}px, ${ty}px) scale(${s})`);
      setCurrent(idx);
      setZoomed(true);
      setSize(100);
      setNote("");
    },
    [zoomed]
  );

  const unzoom = useCallback(() => {
    if (!zoomed) return;
    setZoomed(false);
    setTransform("");
    slotRefs.current[current]?.focus({ preventScroll: true });
  }, [zoomed, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cartOpen) {
        if (e.key === "Escape") setCartOpen(false);
        return;
      }
      if (!zoomed) return;
      if (e.key === "Escape") unzoom();
      if (e.key === "ArrowRight") zoomTo(current + 1);
      if (e.key === "ArrowLeft") zoomTo(current - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, zoomed, current, unzoom, zoomTo]);

  // Re-aim the camera without animating when the window size changes
  useEffect(() => {
    if (!zoomed) return;
    const onResize = () => {
      setInstant(true);
      wallRef.current!.style.transform = "";
      zoomTo(current, true);
      requestAnimationFrame(() => setInstant(false));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [zoomed, current, zoomTo]);

  const product = current >= 0 ? PRODUCTS[current] : null;

  const addToCart = () => {
    if (!product) return;
    saveCart([...cart, { id: product.id, size }]);
    setNote(`Added, ${size} ml.`);
    toast(`${product.name}, ${size} ml added to cart`);
  };

  const total = cart.reduce((t, it) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    return p ? t + priceFor(p, it.size) : t;
  }, 0);

  return (
    <>
      <div className={`scene${zoomed ? " zoomed" : ""}`}>
        <header className="top">
          <div>
            <div className="brand">LUMÉRA</div>
            <div className="sub-brand">The Fragrance Collection</div>
            <div className="tagline">A different perspective.</div>
          </div>
          <nav className="nav" aria-label="Sections">
            <span>Collection</span>
            <span>Men</span>
            <span>Women</span>
            <span>About</span>
          </nav>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            Cart <span className="cart-count">{cart.length}</span>
          </button>
        </header>

        <div className="scroller" onClick={() => zoomed && unzoom()}>
          <main
            className="wall"
            ref={wallRef}
            aria-label="Fragrance wall"
            style={{ transform: transform || undefined, transition: instant ? "none" : undefined }}
          >
            {PRODUCTS.map((p, i) => (
              <button
                key={p.id}
                className={`slot${zoomed && i === current ? " active" : ""}`}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                aria-label={`${p.name}, ${p.family}, ${taka(p.price)}. View`}
                onClick={(e) => {
                  e.stopPropagation();
                  zoomTo(i);
                }}
              >
                <span className="fixture" />
                <span className="beam" />
                <span className="halo" />
                <span className="stage">
                  <img src={photo(p)} alt="" className="bottle" draggable={false} />
                </span>
                <span className="shelf">
                  <span className="top-face" />
                  <span className="edge" />
                </span>
                <span className="info">
                  <b>{p.name}</b>
                  <span>
                    {p.family} · {taka(p.price)}
                  </span>
                  <em>Click to view</em>
                </span>
              </button>
            ))}
          </main>
        </div>

        <div className="zoom-ui" aria-hidden={!zoomed}>
          <div className="z-title">
            <button className="z-back" onClick={unzoom}>
              ← Back to wall
            </button>
            {product && (
              <>
                <div className="z-count">
                  {pad2(current + 1)} / {pad2(count)} · {product.family}
                </div>
                <h2>{product.name}</h2>
                <div className="z-sub">{product.sub}</div>
              </>
            )}
          </div>
          <button className="z-close" onClick={unzoom} aria-label="Close zoom">
            ×
          </button>
          {product && (
            <div className="z-panel" role="group" aria-label="Buy this fragrance">
              <div className="row-line">
                <span>Price</span>
                <strong>{taka(priceFor(product, size))}</strong>
              </div>
              <div className="row-line">
                <span>Size</span>
                <span>Eau de parfum</span>
              </div>
              <div className="sizes">
                {SIZES.map((n) => (
                  <button
                    key={n}
                    className="size"
                    aria-pressed={n === size}
                    onClick={() => {
                      setSize(n);
                      setNote("");
                    }}
                  >
                    {n} ml
                  </button>
                ))}
              </div>
              <button className="add" onClick={addToCart}>
                <span>Add to cart</span>
                <i>+</i>
              </button>
              <p className="note" aria-live="polite">
                {note}
              </p>
              <div className="specs">
                <div>
                  <b>Top</b> · {product.notes[0]}
                </div>
                <div>
                  <b>Heart</b> · {product.notes[1]}
                </div>
                <div>
                  <b>Base</b> · {product.notes[2]}
                </div>
                <div>
                  <b>Delivery</b> · 2–4 days inside Dhaka
                </div>
              </div>
            </div>
          )}
          <div className="z-nav">
            <button onClick={() => zoomTo(current - 1)} aria-label="Previous fragrance">
              ←
            </button>
            <span>
              {current + 1} of {count}
            </span>
            <button onClick={() => zoomTo(current + 1)} aria-label="Next fragrance">
              →
            </button>
          </div>
        </div>
      </div>

      <aside className={`drawer${cartOpen ? " open" : ""}`} aria-label="Cart" aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h3>Cart</h3>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart">
            ×
          </button>
        </div>
        <ul className="lines">
          {cart.length === 0 ? (
            <li className="empty" style={{ display: "block", border: 0 }}>
              Nothing here yet. Pick a fragrance off the wall.
            </li>
          ) : (
            cart.map((item, i) => {
              const p = PRODUCTS.find((x) => x.id === item.id);
              if (!p) return null;
              return (
                <li key={`${item.id}-${i}`}>
                  <img src={photo(p)} alt="" draggable={false} />
                  <div>
                    <div className="n">{p.name}</div>
                    <div className="s">
                      {p.family} · {item.size} ml
                    </div>
                    <button className="rm" onClick={() => saveCart(cart.filter((_, k) => k !== i))}>
                      Remove
                    </button>
                  </div>
                  <div className="p">{taka(priceFor(p, item.size))}</div>
                </li>
              );
            })
          )}
        </ul>
        <div className="total">
          <span>Total</span>
          <span>{taka(total)}</span>
        </div>
        <button
          className="checkout"
          onClick={() => toast(cart.length ? "Checkout isn't connected yet" : "Add a fragrance first")}
        >
          Checkout
        </button>
      </aside>

      <div className={`toast${toastOn ? " show" : ""}`} role="status">
        {toastMsg}
      </div>
    </>
  );
}
