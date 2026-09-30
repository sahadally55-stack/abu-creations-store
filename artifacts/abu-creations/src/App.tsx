import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type Category = 'Home' | 'Desk' | 'Carry' | 'Kitchen';

type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  image: string;
  color: string;
  badge?: string;
  featured?: boolean;
};

type CartLine = { productId: string; quantity: number };

const products: Product[] = [
  {
    id: 'dune-desk-tray',
    name: 'Dune Desk Tray',
    category: 'Desk',
    price: 24,
    description: 'A soft-edged catchall for the small things that make a desk feel considered. Powder-coated steel, made to last.',
    image: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e8edf4',
    badge: 'Staff pick',
    featured: true,
  },
  {
    id: 'field-notebook-set',
    name: 'Field Notebook Set',
    category: 'Desk',
    price: 16,
    description: 'Three pocket-sized notebooks with smooth, fountain-pen friendly paper and a cover that gets better with use.',
    image: 'https://images.pexels.com/photos/261949/pexels-photo-261949.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#f3e9df',
    featured: true,
  },
  {
    id: 'arc-cable-tidy',
    name: 'Arc Cable Tidy',
    category: 'Desk',
    price: 12,
    description: 'A weighted little anchor for charging cables. Set it by your laptop and stop fishing behind the nightstand.',
    image: 'https://images.pexels.com/photos/163125/technology-computer-motherboard-chip-163125.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e6f0ec',
  },
  {
    id: 'daily-tote',
    name: 'Daily Carry Tote',
    category: 'Carry',
    price: 38,
    description: 'A roomy, sturdy cotton tote with an interior pocket for the things you need within reach.',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e6e8f3',
    badge: 'New in',
    featured: true,
  },
  {
    id: 'folding-bottle',
    name: 'Fold Flask',
    category: 'Carry',
    price: 22,
    description: 'A slim reusable bottle that folds down when empty. Leakproof, lightweight, and easy to keep nearby.',
    image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e1eff2',
  },
  {
    id: 'quiet-key-ring',
    name: 'Quiet Key Ring',
    category: 'Carry',
    price: 14,
    description: 'A compact key loop in vegetable-tanned leather, designed to sit quietly in your pocket.',
    image: 'https://images.pexels.com/photos/1152226/pexels-photo-1152226.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#f2e6db',
  },
  {
    id: 'linen-hand-towel',
    name: 'Linen Hand Towel',
    category: 'Home',
    price: 19,
    description: 'Washed linen with a dry, welcoming hand. A small upgrade for the kitchen or bathroom.',
    image: 'https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e9edf0',
  },
  {
    id: 'soft-glass-carafe',
    name: 'Soft Glass Carafe',
    category: 'Home',
    price: 32,
    description: 'A clear, easy-pour carafe for the desk, bedside table, or dinner with friends.',
    image: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#e0edf0',
  },
  {
    id: 'pinch-bowl-pair',
    name: 'Pinch Bowl Pair',
    category: 'Kitchen',
    price: 18,
    description: 'Two tiny glazed stoneware bowls for salt, spices, rings, or whatever is currently in your hands.',
    image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#f0e8e3',
  },
  {
    id: 'oak-measuring-spoon',
    name: 'Oak Measuring Spoon',
    category: 'Kitchen',
    price: 15,
    description: 'One handsome spoon for coffee, baking, and the drawer that deserves one good tool.',
    image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: '#f2e8d8',
  },
];

const categories: { name: Category; count: number; description: string; mark: string }[] = [
  { name: 'Home', count: 2, description: 'Soft touches, useful objects', mark: '01' },
  { name: 'Desk', count: 3, description: 'Make room for good work', mark: '02' },
  { name: 'Carry', count: 3, description: 'Out the door, sorted', mark: '03' },
  { name: 'Kitchen', count: 2, description: 'Tools for daily rituals', mark: '04' },
];

type ShopContextValue = {
  cart: CartLine[];
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  cartCount: number;
  cartTotal: number;
  notice: string | null;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error('useShop must be used within ShopProvider');
  return value;
}

function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const addToCart = (productId: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId);
      return existing
        ? current.map((line) => line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { productId, quantity: 1 }];
    });
    const product = products.find((item) => item.id === productId);
    setNotice(`${product?.name ?? 'Item'} added to your bag`);
    window.setTimeout(() => setNotice(null), 2600);
  };
  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) => quantity < 1 ? current.filter((line) => line.productId !== productId) : current.map((line) => line.productId === productId ? { ...line, quantity } : line));
  };
  const removeFromCart = (productId: string) => setCart((current) => current.filter((line) => line.productId !== productId));
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.price ?? 0) * line.quantity;
  }, 0);

  return (
    <ShopContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, cartCount, cartTotal, notice }}>
      {children}
    </ShopContext.Provider>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" data-testid="link-home-logo">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold tracking-[-0.08em] text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))]">ab</span>
      <span className="text-[15px] font-extrabold tracking-[-0.04em]">Abu <span className="font-medium text-muted-foreground">Creations</span></span>
    </Link>
  );
}

function Header() {
  const { cartCount } = useShop();
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocation(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
    setMenuOpen(false);
  };
  return (
    <>
      <div className="topline border-b border-primary/10 bg-primary px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
        Thoughtful things for ordinary days <span className="mx-1.5 text-accent">·</span> Free delivery over $60
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-[330px] flex-1 md:block" data-testid="form-header-search">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the edit" className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-header-search" />
          </form>
          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/" className={`rounded-full px-3 py-2 text-sm font-semibold smooth hover:bg-secondary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-shop">Shop</Link>
            <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground smooth hover:bg-secondary hover:text-foreground" data-testid="link-admin">Admin</Link>
          </nav>
          <Link href="/cart" className="relative flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-bold text-foreground smooth hover:border-primary hover:text-primary" data-testid="link-cart">
            <ShoppingBag className="size-[17px]" strokeWidth={1.8} />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && <span className="cart-pop flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-accent-foreground" data-testid="text-cart-count">{cartCount}</span>}
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
            <form onSubmit={submitSearch} className="relative mb-3" data-testid="form-mobile-search">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the edit" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary" data-testid="input-mobile-search" />
            </form>
            <div className="flex gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-bold" data-testid="link-mobile-shop">Shop</Link>
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-bold" data-testid="link-mobile-admin">Admin</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function Notice() {
  const { notice } = useShop();
  if (!notice) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-3 text-xs font-bold text-background shadow-float" role="status" data-testid="status-cart-notice">
      <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="size-3" strokeWidth={3} /></span>
      {notice}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="app-shell min-h-[100dvh]"><Header />{children}<Notice /><Footer /></div>;
}

function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/60">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-extrabold tracking-[-0.03em]">Abu Creations</p>
          <p className="mt-1 text-xs text-muted-foreground">A small edit of useful, good-looking things.</p>
        </div>
        <div className="flex items-center gap-5 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary" /> Secure checkout</span>
          <span className="flex items-center gap-1.5"><PackageCheck className="size-3.5 text-primary" /> Packed with care</span>
          <span className="font-mono-ui text-[10px] tracking-wide">© 2024 AC</span>
        </div>
      </div>
    </footer>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 flex items-center gap-2 font-mono-ui text-[10px] font-medium uppercase tracking-[0.18em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{children}</p>;
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShop();
  return (
    <article className="group relative flex min-w-0 flex-col" data-testid={`card-product-${product.id}`}>
      <div className="relative overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: product.color }}>
        <Link href={`/product/${product.id}`} className="block aspect-[1.06] overflow-hidden" data-testid={`link-product-${product.id}`}>
          <img src={product.image} alt={product.name} className="image-lift h-full w-full object-cover mix-blend-multiply" loading="lazy" data-testid={`img-product-${product.id}`} />
        </Link>
        {product.badge && <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary shadow-sm">{product.badge}</span>}
        <button type="button" onClick={() => addToCart(product.id)} className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background opacity-100 shadow-lg transition duration-200 hover:bg-primary sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 sm:h-11 sm:w-11" aria-label={`Add ${product.name} to bag`} data-testid={`button-add-${product.id}`}>
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
      <Link href={`/product/${product.id}`} className="mt-3 flex items-start justify-between gap-3" data-testid={`link-product-info-${product.id}`}>
        <span>
          <span className="block text-sm font-bold tracking-[-0.02em]">{product.name}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{product.category}</span>
        </span>
        <span className="font-mono-ui pt-0.5 text-xs font-medium">${product.price.toFixed(2)}</span>
      </Link>
    </article>
  );
}

function CategoryCard({ category, onSelect }: { category: (typeof categories)[number]; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="group flex min-h-[142px] flex-col justify-between rounded-[1.25rem] border border-border bg-card p-5 text-left shadow-card smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-float" data-testid={`button-category-${category.name.toLowerCase()}`}>
      <span className="flex items-center justify-between">
        <span className="font-mono-ui text-[10px] text-primary">{category.mark}</span>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </span>
      <span>
        <span className="block text-base font-extrabold tracking-[-0.03em]">{category.name}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{category.description}</span>
      </span>
    </button>
  );
}

function Home() {
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [query, setQuery] = useState(() => new URLSearchParams(location.split('?')[1] ?? '').get('q') ?? '');
  useEffect(() => {
    setQuery(new URLSearchParams(location.split('?')[1] ?? '').get('q') ?? '');
  }, [location]);
  const filtered = useMemo(() => products.filter((product) => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const queryMatch = !query.trim() || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  }), [query, selectedCategory]);
  const featured = products.filter((product) => product.featured);
  const carry = products.filter((product) => product.category === 'Carry');
  const kitchen = products.filter((product) => product.category === 'Kitchen');
  const showingSearch = query.trim() || selectedCategory !== 'All';
  const updateCategory = (category: Category) => {
    setSelectedCategory(category);
    setQuery('');
    setLocation('/');
    window.setTimeout(() => document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  };
  return (
    <main>
      <section className="mx-auto max-w-[1280px] px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="fade-up max-w-3xl">
            <SectionLabel>The Abu edit / 01</SectionLabel>
            <h1 className="text-balance text-[clamp(2.7rem,7vw,6.7rem)] font-extrabold leading-[0.94] tracking-[-0.075em] text-foreground">Useful things, <span className="text-primary">chosen well.</span></h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">Everyday objects with a little more thought in them. Find the pieces that make a day run better.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#product-list" className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_hsl(var(--accent))]" data-testid="link-browse-all">Browse the edit <ArrowRight className="size-4 transition group-hover:translate-x-1" /></a>
              <span className="font-mono-ui text-[10px] uppercase tracking-[0.12em] text-muted-foreground">10 considered objects</span>
            </div>
          </div>
          <div className="fade-up fade-up-delay-2 relative min-h-[255px] overflow-hidden rounded-[1.75rem] bg-[#d8e8f5] p-6 sm:min-h-[310px]">
            <div className="absolute -right-8 -top-10 size-48 rounded-full border-[26px] border-accent/80" />
            <div className="absolute -bottom-16 -left-12 size-56 rounded-full bg-primary/90" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary/80">A good place to start</span>
              <div className="max-w-[240px]">
                <p className="text-2xl font-extrabold leading-[1.05] tracking-[-0.06em] text-primary">Small upgrades. Noticeable difference.</p>
                <p className="mt-3 text-xs leading-5 text-primary/70">No endless scrolling. Just a tight edit of things we would keep.</p>
              </div>
              <span className="absolute bottom-5 right-5 font-mono-ui text-[10px] font-medium text-primary/70">AC—24</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/55">
        <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div><SectionLabel>Shop by feeling</SectionLabel><h2 className="text-xl font-extrabold tracking-[-0.05em] sm:text-2xl">Where do you want a little more ease?</h2></div>
            <Sparkles className="hidden size-5 text-accent sm:block" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((category) => <CategoryCard key={category.name} category={category} onSelect={() => updateCategory(category.name)} />)}
          </div>
        </div>
      </section>

      <section id="product-list" className="mx-auto max-w-[1280px] scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><SectionLabel>{showingSearch ? 'Your search' : 'The useful edit'}</SectionLabel><h2 className="text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">{showingSearch ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}` : 'The pieces we keep close'}</h2></div>
          <div className="flex flex-wrap items-center gap-2">
            {(['All', ...categories.map((category) => category.name)] as const).map((category) => <button type="button" key={category} onClick={() => { setSelectedCategory(category); if (category === 'All') setQuery(''); }} className={`rounded-full px-3 py-1.5 text-xs font-bold smooth ${selectedCategory === category ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`} data-testid={`button-filter-${category.toLowerCase()}`}>{category}</button>)}
          </div>
        </div>
        {showingSearch ? (
          filtered.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptySearch onReset={() => { setQuery(''); setSelectedCategory('All'); }} />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>

      {!showingSearch && <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-5 overflow-hidden rounded-[1.75rem] bg-foreground p-6 text-background sm:p-8 lg:grid-cols-[.72fr_1.28fr] lg:p-12">
          <div className="flex flex-col justify-between">
            <div><SectionLabel>Carry less / live more</SectionLabel><h2 className="max-w-sm text-3xl font-extrabold leading-[1] tracking-[-0.065em] text-background sm:text-4xl">Everything you need, nothing you do not.</h2></div>
            <Link href="/?q=carry" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-accent pb-1 text-sm font-bold text-background" data-testid="link-carry-edit">See the carry edit <ArrowRight className="size-4 text-accent" /></Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">{carry.map((product) => <Link href={`/product/${product.id}`} key={product.id} className="group" data-testid={`link-carry-${product.id}`}><div className="aspect-[.86] overflow-hidden rounded-2xl bg-secondary"><img src={product.image} alt={product.name} className="image-lift h-full w-full object-cover mix-blend-multiply" loading="lazy" /></div><p className="mt-3 text-xs font-bold text-background/90">{product.name}</p></Link>)}</div>
        </div>
      </section>}

      {!showingSearch && <section className="border-t border-border/70 bg-secondary/35">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8 lg:py-20">
          <div><SectionLabel>Good in the kitchen</SectionLabel><h2 className="max-w-sm text-4xl font-extrabold leading-[.98] tracking-[-0.07em]">Make room for the everyday ritual.</h2><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">The little tools that make morning coffee, weeknight dinners, and a glass of water feel more like yours.</p><Link href="/?q=kitchen" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-kitchen-edit">Explore kitchen <ChevronRight className="size-4" /></Link></div>
          <div className="grid grid-cols-2 gap-4">{kitchen.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>}
    </main>
  );
}

function EmptySearch({ onReset }: { onReset: () => void }) {
  return <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"><Search className="mx-auto size-6 text-muted-foreground" /><h3 className="mt-4 text-lg font-extrabold tracking-[-0.03em]">Nothing in this corner yet.</h3><p className="mt-2 text-sm text-muted-foreground">Try another word or browse the full edit.</p><button type="button" onClick={onReset} className="mt-5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="button-reset-search">Show everything</button></div>;
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useShop();
  const product = products.find((item) => item.id === id);
  if (!product) return <main className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-extrabold">That item has moved on.</h1><Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-back-to-shop"><ArrowLeft className="size-4" /> Back to the shop</Link></main>;
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground smooth hover:text-primary" data-testid="link-detail-back"><ArrowLeft className="size-3.5" /> Back to the edit</Link>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div className="relative overflow-hidden rounded-[1.75rem]" style={{ backgroundColor: product.color }}><img src={product.image} alt={product.name} className="aspect-square h-full w-full object-cover mix-blend-multiply" data-testid={`img-detail-${product.id}`} />{product.badge && <span className="absolute left-5 top-5 rounded-full bg-card px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">{product.badge}</span>}</div>
        <div className="flex flex-col justify-center py-1">
          <SectionLabel>{product.category} / 0{products.indexOf(product) + 1}</SectionLabel>
          <h1 className="max-w-lg text-4xl font-extrabold leading-[.98] tracking-[-0.07em] sm:text-6xl" data-testid="text-product-name">{product.name}</h1>
          <p className="mt-5 font-mono-ui text-lg text-primary" data-testid="text-product-price">${product.price.toFixed(2)}</p>
          <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground" data-testid="text-product-description">{product.description}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => addToCart(product.id)} className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_hsl(var(--accent))] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_hsl(var(--accent))]" data-testid="button-detail-add">Add to bag <ShoppingBag className="size-4" /></button><Link href="/cart" className="inline-flex h-13 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-bold smooth hover:border-primary hover:text-primary" data-testid="link-go-to-bag">View bag</Link></div>
          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><PackageCheck className="size-4 text-primary" /> Ships in 1–2 days</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Easy returns</span></div>
        </div>
      </div>
      {related.length > 0 && <section className="mt-20 border-t border-border pt-10"><div className="flex items-end justify-between"><div><SectionLabel>More from {product.category.toLowerCase()}</SectionLabel><h2 className="text-2xl font-extrabold tracking-[-0.05em]">Keep the good company</h2></div><Link href="/" className="hidden items-center gap-1 text-xs font-bold text-primary sm:flex" data-testid="link-detail-shop-more">Shop all <ArrowRight className="size-3.5" /></Link></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}

function Cart() {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useShop();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const lines = cart.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId)! })).filter((line) => line.product);
  const setField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (form.name.trim() && form.phone.trim() && form.address.trim()) setSubmitted(true); };
  if (submitted) return <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:py-32"><span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[5px_5px_0_hsl(var(--accent))]"><Check className="size-7" /></span><SectionLabel>Order received</SectionLabel><h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">Thank you, {form.name.split(' ')[0]}.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">We have your details and will be in touch at {form.phone} to confirm delivery.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-continue-shopping">Continue shopping <ArrowRight className="size-4" /></Link></main>;
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10"><SectionLabel>Your bag</SectionLabel><h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-6xl">Ready when you are<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">{cartCount === 0 ? 'A good place for your next useful thing.' : `${cartCount} ${cartCount === 1 ? 'item' : 'items'} selected with care.`}</p></div>
      {lines.length === 0 ? <div className="grid min-h-[320px] place-items-center rounded-[1.5rem] border border-dashed border-border bg-card px-5 text-center"><div><ShoppingBag className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 text-xl font-extrabold tracking-[-0.04em]">Your bag is taking a quiet moment.</h2><p className="mt-2 text-sm text-muted-foreground">Add something useful and it will show up here.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-empty-shop">Browse the shop</Link></div></div> : <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-14">
        <div className="divide-y divide-border rounded-[1.5rem] border border-border bg-card px-4 sm:px-6">{lines.map(({ product, quantity }) => <div key={product.id} className="flex gap-4 py-5 sm:gap-5"><Link href={`/product/${product.id}`} className="size-24 shrink-0 overflow-hidden rounded-xl sm:size-32" style={{ backgroundColor: product.color }} data-testid={`link-cart-product-${product.id}`}><img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply" /></Link><div className="flex min-w-0 flex-1 flex-col justify-between py-0.5"><div className="flex justify-between gap-3"><div><p className="text-sm font-bold">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{product.category}</p></div><p className="font-mono-ui text-xs">${(product.price * quantity).toFixed(2)}</p></div><div className="flex items-center justify-between"><div className="flex items-center rounded-full border border-border"><button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="flex size-8 items-center justify-center text-muted-foreground hover:text-primary" aria-label={`Decrease ${product.name} quantity`} data-testid={`button-decrease-${product.id}`}><Minus className="size-3" /></button><span className="w-6 text-center font-mono-ui text-xs" data-testid={`text-quantity-${product.id}`}>{quantity}</span><button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} className="flex size-8 items-center justify-center text-muted-foreground hover:text-primary" aria-label={`Increase ${product.name} quantity`} data-testid={`button-increase-${product.id}`}><Plus className="size-3" /></button></div><button type="button" onClick={() => removeFromCart(product.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive" data-testid={`button-remove-${product.id}`}><Trash2 className="size-3.5" /> Remove</button></div></div></div>)}</div>
        <aside className="h-fit rounded-[1.5rem] border border-border bg-card p-5 shadow-card sm:p-7"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold tracking-[-0.05em]">Delivery details</h2><span className="font-mono-ui text-[10px] text-muted-foreground">01 / 01</span></div><div className="my-6 flex items-center justify-between border-y border-border py-4 text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-ui font-medium" data-testid="text-cart-total">${cartTotal.toFixed(2)}</span></div><form onSubmit={submit} className="space-y-4" data-testid="form-checkout"><label className="block"><span className="mb-1.5 block text-xs font-bold">Your name</span><input required value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Amina Rahman" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-checkout-name" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Phone number</span><div className="relative"><Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input required type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+1 555 014 2280" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-checkout-phone" /></div></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Delivery address</span><div className="relative"><MapPin className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" /><textarea required rows={3} value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Street, area, city" className="w-full resize-none rounded-xl border border-border bg-background py-3 pl-10 pr-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-checkout-address" /></div></label><button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent))] transition hover:translate-x-0.5 hover:translate-y-0.5" data-testid="button-submit-checkout">Place demo order <ArrowRight className="size-4" /></button><p className="text-center text-[10px] leading-4 text-muted-foreground">This demo does not process payment. We will confirm your order by phone.</p></form></aside>
      </div>}
    </main>
  );
}

function Admin() {
  const [signedIn, setSignedIn] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (form.email && form.password) setSignedIn(true); };
  if (signedIn) return <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16"><div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end"><div><SectionLabel>Admin / workspace</SectionLabel><h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-6xl">Good morning<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-muted-foreground">A quiet place to keep the edit tidy.</p></div><button type="button" onClick={() => setSignedIn(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-bold hover:border-primary hover:text-primary" data-testid="button-admin-signout"><LockKeyhole className="size-3.5" /> Sign out</button></div><section className="mt-8 grid gap-5 md:grid-cols-3"><div className="rounded-[1.25rem] bg-primary p-6 text-primary-foreground"><LayoutDashboard className="size-5" /><p className="mt-10 font-mono-ui text-[10px] uppercase tracking-widest text-primary-foreground/65">Live products</p><p className="mt-1 text-4xl font-extrabold tracking-[-0.07em]">10</p></div><div className="rounded-[1.25rem] border border-border bg-card p-6"><PackageCheck className="size-5 text-primary" /><p className="mt-10 font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">Orders today</p><p className="mt-1 text-4xl font-extrabold tracking-[-0.07em]">—</p></div><div className="rounded-[1.25rem] border border-border bg-card p-6"><Sparkles className="size-5 text-accent" /><p className="mt-10 font-mono-ui text-[10px] uppercase tracking-widest text-muted-foreground">Next up</p><p className="mt-1 text-lg font-extrabold tracking-[-0.04em]">Product tools</p></div></section><section className="mt-8 overflow-hidden rounded-[1.5rem] border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-7"><div><h2 className="font-extrabold tracking-[-0.04em]">Product management</h2><p className="mt-1 text-xs text-muted-foreground">The next build step starts here.</p></div><button type="button" disabled className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-muted-foreground" data-testid="button-admin-add-product">Add product</button></div><div className="p-5 sm:p-7"><div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background py-14 text-center"><Sparkles className="size-6 text-accent" /><h3 className="mt-4 font-extrabold">Your product desk is ready for its first tool.</h3><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Catalog editing, inventory, and order review will land in the next build. This preview confirms the workspace is in place.</p></div></div></section></main>;
  return <main className="mx-auto flex max-w-[520px] items-center px-4 py-16 sm:min-h-[calc(100dvh-170px)] sm:py-20"><div className="w-full rounded-[1.5rem] border border-border bg-card p-6 shadow-card sm:p-9"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-5" /></span><SectionLabel>Abu Creations / private</SectionLabel><h1 className="text-3xl font-extrabold tracking-[-0.06em]">The back room.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in to the simple product workspace. This demo gate is ready for the admin build.</p><form onSubmit={submit} className="mt-8 space-y-4" data-testid="form-admin-login"><label className="block"><span className="mb-1.5 block text-xs font-bold">Email address</span><input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="hello@abucreations.com" className="h-12 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-admin-email" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Password</span><input required type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-admin-password" /></label><button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground" data-testid="button-admin-signin">Enter workspace <ArrowRight className="size-4" /></button></form></div></main>;
}

function Router() {
  return <Shell><ErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/product/:id" component={ProductDetail} /><Route path="/cart" component={Cart} /><Route path="/admin" component={Admin} /><Route component={NotFound} /></Switch></ErrorBoundary></Shell>;
}

const queryClient = new QueryClient();

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ShopProvider><Router /></ShopProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;