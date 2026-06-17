"use client"

import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProducts } from "@/context/products-context"
import { PRODUCT_CATEGORIES } from "@/lib/data"

type AddProductDialogProps = {
  /** When false, dialog is not rendered */
  canAdd: boolean
}

const defaultImage =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=450&fit=crop&q=80"

export function AddProductDialog({ canAdd }: AddProductDialogProps) {
  const { addProduct } = useProducts()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [nameUrdu, setNameUrdu] = useState("")
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0])
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState("50kg Bag")
  const [stock, setStock] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(defaultImage)

  if (!canAdd) return null

  const reset = () => {
    setName("")
    setNameUrdu("")
    setCategory(PRODUCT_CATEGORIES[0])
    setPrice("")
    setUnit("50kg Bag")
    setStock("")
    setDescription("")
    setImage(defaultImage)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const p = Number(price)
    const s = Number(stock)
    if (!name.trim() || !Number.isFinite(p) || p < 0 || !Number.isFinite(s) || s < 0) return

    addProduct({
      name: name.trim(),
      nameUrdu: nameUrdu.trim() || name.trim(),
      category,
      price: p,
      unit: unit.trim() || "50kg Bag",
      stock: Math.floor(s),
      description: description.trim() || name.trim(),
      image: image.trim() || defaultImage,
    })
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2 rounded-full shadow-md shadow-primary/15">
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Add product</DialogTitle>
          <DialogDescription>
            New items appear in the shop catalog immediately. Owner and manager only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ap-name">Product name (English)</Label>
              <Input
                id="ap-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Custom blend NP"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ap-urdu">Name (Urdu)</Label>
              <Input
                id="ap-urdu"
                value={nameUrdu}
                onChange={(e) => setNameUrdu(e.target.value)}
                placeholder="اردو نام"
                className="h-11 rounded-xl text-right"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-unit">Unit</Label>
              <Input
                id="ap-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="50kg Bag"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-price">Price (Rs.)</Label>
              <Input
                id="ap-price"
                type="number"
                required
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-stock">Stock (bags / units)</Label>
              <Input
                id="ap-stock"
                type="number"
                required
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ap-desc">Description</Label>
              <Textarea
                id="ap-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for customers"
                className="min-h-[88px] rounded-xl"
                rows={3}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ap-img">Image path</Label>
              <Input
                id="ap-img"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/products/your-image.jpg"
                className="h-11 rounded-xl font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Place files in <code className="rounded bg-muted px-1">public/products/</code> or reuse an existing path.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2 sm:justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full font-semibold">
              Save product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
