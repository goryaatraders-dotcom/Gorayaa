"use client"

import { Plus, Minus, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/product-image"
import type { Product } from "@/lib/data"

interface ProductCardProps {
  product: Product
  quantity?: number
  onAddToCart: (product: Product) => void
  onRemoveFromCart: (productId: string) => void
  /** When false, cannot increase quantity (e.g. at stock limit or out of stock) */
  canAddMore?: boolean
  index?: number
}


/*************  ✨ Windsurf Command ⭐  *************/
/**
 * A component that displays a product with its details and
 * allows the user to add or remove the product from their cart.
 *
 * @param {Object} product - The product to be displayed.
 * @param {number} [quantity=0] - The number of items of the product in the cart.
 * @param {Function} onAddToCart - A callback function to add the product to the cart.
 * @param {Function} onRemoveFromCart - A callback function to remove the product from the cart.
 * @param {boolean} [canAddMore=true] - Whether the user can add more items of the product to their cart.
 * @param {number} [index=0] - The index of the product in the products list.
 */
/*******  ed9bd0c7-fd3c-4d0b-a6c3-adb4a88b9fd9  *******/
export function ProductCard({ 
  product, 
  quantity = 0, 
  onAddToCart, 
  onRemoveFromCart,
  canAddMore = true,
  index = 0
}: ProductCardProps) {
  return (
    <Card 
      className={`
        group overflow-hidden rounded-3xl border border-border/50 bg-card/95 shadow-sm
        hover-lift
        opacity-0 animate-fade-in-up
        stagger-${(index % 8) + 1}
      `}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-muted/80 to-accent/10 transition-all duration-500 group-hover:from-secondary group-hover:to-accent/20">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-105"
          priority={index < 4}
        />
        {/* Category tag */}
        <Badge 
          className="absolute top-4 left-4 bg-background/90 text-foreground text-xs font-medium rounded-full px-3 py-1 border-0"
        >
          {product.category}
        </Badge>

        {/* Low stock indicator */}
        {product.stock < 50 && (
          <Badge 
            variant="destructive" 
            className="absolute top-4 right-4 text-xs rounded-full px-3 animate-pulse-subtle"
          >
            Low Stock
          </Badge>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
        
        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-foreground" />
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-accent transition-colors duration-300">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{product.nameUrdu}</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
        
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-foreground">
              Rs. {product.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground ml-1">/ {product.unit}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {product.stock} in stock
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {quantity === 0 ? (
          <Button 
            className="group/btn h-12 w-full gap-2 rounded-full text-base font-semibold shadow-md shadow-primary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20" 
            disabled={!canAddMore || product.stock <= 0}
            onClick={() => onAddToCart(product)}
          >
            <Plus className="h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-90" />
            {product.stock <= 0 ? "Out of stock" : "Add to Cart"}
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full gap-3 animate-scale-in">
            <Button 
              variant="secondary" 
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors duration-300"
              onClick={() => onRemoveFromCart(product.id)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="text-2xl font-black text-foreground flex-1 text-center">{quantity}</span>
            <Button 
              size="icon"
              className="h-12 w-12 rounded-full transition-all duration-300"
              disabled={!canAddMore}
              onClick={() => onAddToCart(product)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
