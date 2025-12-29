import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSkeleton } from '@/components/product/ProductSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, categories } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  const activeCategory = searchParams.get('category') || 'all';
  const { data: products = [], isLoading } = useProducts();

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description?.toLowerCase().includes(lowercaseQuery) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Stock filter
    if (stockFilter === 'in-stock') {
      result = result.filter(p => p.in_stock);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(p => !p.in_stock);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, sortBy, priceRange, stockFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('rating-desc');
    setPriceRange([0, 150000]);
    setStockFilter('all');
    handleCategoryChange('all');
  };

  const hasActiveFilters = searchQuery || activeCategory !== 'all' || 
    stockFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 150000;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-8 lg:py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-2">
              {categories.find(c => c.id === activeCategory)?.name || 'All Products'}
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-8">
          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort & Filter Toggle */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="rating-desc">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>

              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="default"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className={cn(
              "w-64 flex-shrink-0 space-y-6",
              "hidden lg:block"
            )}>
              {/* Categories */}
              <div>
                <h3 className="font-heading font-semibold mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        activeCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="font-heading font-semibold mb-3">Availability</h3>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'in-stock', label: 'In Stock' },
                    { id: 'out-of-stock', label: 'Out of Stock' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setStockFilter(option.id as typeof stockFilter)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        stockFilter === option.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-0 h-full w-80 bg-background p-6 shadow-xl overflow-y-auto animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-semibold text-lg">Filters</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-heading font-semibold mb-3">Categories</h3>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            handleCategoryChange(category.id);
                            setShowFilters(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            activeCategory === category.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div>
                    <h3 className="font-heading font-semibold mb-3">Availability</h3>
                    <div className="space-y-1">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'in-stock', label: 'In Stock' },
                        { id: 'out-of-stock', label: 'Out of Stock' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setStockFilter(option.id as typeof stockFilter);
                            setShowFilters(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            stockFilter === option.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}