import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Plus, Pencil, Trash2, X, Package,
  Search, Upload, Image as ImageIcon, Loader2, CheckSquare, Square
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  images: string[] | null;
  category: string;
  in_stock: boolean | null;
  status: string | null;
  rating: number | null;
  reviews: number | null;
  sku: string | null;
  stock: unknown;
  sizes: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  featured: boolean | null;
  trackInventory?: boolean;
  totalStock?: number;
}

const categories = ['mice', 'keyboards', 'headsets', 'mousepads', 'ssds', 'cpu', 'accessories'];

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  original_price: null as number | null,
  image: '',
  images: [] as string[],
  category: 'mice',
  in_stock: true,
  status: 'available',
  rating: 0,
  reviews: 0,
  sku: '',
  stock: { 'One Size': { 'Default': 10 } } as Record<string, Record<string, number>>,
  sizes: ['One Size'] as string[],
  colors: ['Default'] as string[],
  tags: [] as string[],
  featured: false,
  trackInventory: true,
  totalStock: 10,
};

export default function AdminProducts() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [trackInventory, setTrackInventory] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(10);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActioning, setIsBulkActioning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset uploaded images when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingProduct) {
        setUploadedImages([editingProduct.image, ...(editingProduct.images || [])].filter(Boolean));
      } else {
        setUploadedImages([]);
      }
    }
  }, [isDialogOpen, editingProduct]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching products',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setUploadedImages([]);
    setTrackInventory(true);
    setStockQuantity(10);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const productStock = (product.stock as Record<string, Record<string, number>>) || {};
    // Calculate total stock from the stock object
    let totalStock = 0;
    Object.values(productStock).forEach(sizeStock => {
      Object.values(sizeStock).forEach(qty => {
        totalStock += qty;
      });
    });
    setStockQuantity(totalStock > 0 ? totalStock : 10);
    setTrackInventory(totalStock > 0);
    
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      image: product.image,
      images: product.images || [],
      category: product.category,
      in_stock: product.in_stock ?? true,
      status: product.status || 'available',
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      sku: product.sku || '',
      stock: productStock,
      sizes: product.sizes || ['One Size'],
      colors: product.colors || ['Default'],
      tags: product.tags || [],
      featured: product.featured ?? false,
      trackInventory: totalStock > 0,
      totalStock: totalStock > 0 ? totalStock : 10,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Product deleted' });
      fetchProducts();
    }
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} product(s)?`)) return;

    setIsBulkActioning(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      
      toast({ title: `${selectedIds.size} product(s) deleted` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error deleting products',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;

    setIsBulkActioning(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      
      toast({ title: `${selectedIds.size} product(s) updated to ${status}` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error updating products',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload only image files',
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (max 4MB)
        if (file.size > 4 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'Image must be less than 4MB',
            variant: 'destructive',
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload failed',
            description: uploadError.message,
            variant: 'destructive',
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      if (newImages.length > 0) {
        setUploadedImages(prev => [...prev, ...newImages]);
        toast({ title: `${newImages.length} image(s) uploaded` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async () => {
    // Input validation
    const name = formData.name?.trim();
    if (!name) {
      toast({
        title: 'Missing product name',
        description: 'Please enter a product name',
        variant: 'destructive',
      });
      return;
    }
    
    if (name.length > 200) {
      toast({
        title: 'Name too long',
        description: 'Product name must be less than 200 characters',
        variant: 'destructive',
      });
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (price > 100000000) {
      toast({
        title: 'Price too high',
        description: 'Price must be less than 100,000,000 DZD',
        variant: 'destructive',
      });
      return;
    }

    if (formData.original_price && Number(formData.original_price) <= price) {
      toast({
        title: 'Invalid compare price',
        description: 'Compare at price must be higher than the sale price',
        variant: 'destructive',
      });
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one product image',
        variant: 'destructive',
      });
      return;
    }

    if (formData.description && formData.description.length > 5000) {
      toast({
        title: 'Description too long',
        description: 'Description must be less than 5000 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    // Build stock object from sizes and colors with quantities
    const sizes = formData.sizes?.length ? formData.sizes : ['One Size'];
    const colors = formData.colors?.length ? formData.colors : ['Default'];
    
    // Build stock matrix - distribute stock evenly across variants
    const stockObj: Record<string, Record<string, number>> = {};
    const variantCount = sizes.length * colors.length;
    const perVariantStock = trackInventory ? Math.max(1, Math.floor(stockQuantity / variantCount)) : 999;
    
    sizes.forEach(size => {
      stockObj[size] = {};
      colors.forEach(color => {
        stockObj[size][color] = perVariantStock;
      });
    });

    const productData = {
      name: name, // Use validated trimmed name
      description: formData.description?.trim() || null,
      price: price,
      original_price: formData.original_price ? Number(formData.original_price) : null,
      image: uploadedImages[0], // First image is the main image
      images: uploadedImages.slice(1), // Rest are additional images
      category: formData.category,
      in_stock: trackInventory ? stockQuantity > 0 : true,
      status: formData.status,
      rating: formData.rating,
      reviews: formData.reviews,
      sku: formData.sku?.trim() || null,
      stock: stockObj,
      sizes: sizes,
      colors: colors,
      tags: formData.tags,
      featured: formData.featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({
          title: 'Error updating product',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Product updated' });
        setIsDialogOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast({
          title: 'Error adding product',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Product added' });
        setIsDialogOpen(false);
        fetchProducts();
      }
    }

    setIsSaving(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-foreground" />
                <span className="text-base font-semibold text-foreground">Products</span>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={handleAdd} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add product
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">You need admin privileges to manage products.</p>
          </div>
        )}

        {/* Search and Bulk Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="h-4 w-px bg-border" />
              <Select onValueChange={handleBulkStatusChange} disabled={isBulkActioning}>
                <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent text-sm font-medium px-2">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Active</SelectItem>
                  <SelectItem value="soon">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkActioning}
                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-7 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No products found</p>
          </div>
        ) : (
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAll}
                      disabled={!isAdmin}
                    />
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Inventory</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-right p-3 font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const productStock = (product.stock as Record<string, Record<string, number>>) || {};
                  let totalStock = 0;
                  Object.values(productStock).forEach(sizeStock => {
                    Object.values(sizeStock).forEach(qty => { totalStock += qty; });
                  });
                  
                  return (
                    <tr key={product.id} className={`hover:bg-muted/30 ${selectedIds.has(product.id) ? 'bg-muted/20' : ''}`}>
                      <td className="w-10 p-3">
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleSelect(product.id)}
                          disabled={!isAdmin}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded bg-muted"
                          />
                          <div>
                            <p className="font-medium text-foreground text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.price.toLocaleString()} DZD</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.status === 'available' 
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'soon'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.status === 'available' ? 'Active' : product.status === 'soon' ? 'Draft' : 'Archived'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground capitalize">{product.category}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            disabled={!isAdmin}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            disabled={!isAdmin}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gaming-blue">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (DZD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Compare at Price (for discounts)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? Number(e.target.value) : null })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gaming-blue">Images</h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-gaming-blue text-gaming-blue hover:bg-gaming-blue/10"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                For best visual appearance, use a product image with a size of 800x800.
              </p>

              {/* Uploaded Images Grid */}
              {uploadedImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-gaming-blue text-white text-xs px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Upload Images" to add product photos</p>
                </div>
              )}
            </div>

            {/* Storage Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gaming-blue">Storage Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'available'}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="soon">Coming Soon</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gaming-blue">Variants</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    placeholder="S, M, L, XL or One Size"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colors">Colors (comma-separated)</Label>
                  <Input
                    id="colors"
                    value={formData.colors?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    placeholder="Black, White, Red"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gaming-blue">Inventory</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(e) => setTrackInventory(e.target.checked)}
                    className="rounded border-border w-4 h-4"
                  />
                  <span className="text-sm font-medium">Track inventory</span>
                </label>
                
                {trackInventory && (
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Total Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        min="0"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Stock will be distributed across all size/color variants
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gaming-blue">Visibility</h3>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Featured Product</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} variant="default">
              {isSaving ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}