"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useCropRates } from "@/context/crop-rates-context"
import { toast } from "sonner"
import type { CropRate } from "@/lib/data"

export function CropRatesManager() {
  const { cropRates, addCropRate, updateCropRate, deleteCropRate } = useCropRates()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Add state
  const [newCropName, setNewCropName] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newIsActive, setNewIsActive] = useState(true)

  // Edit state
  const [editingRate, setEditingRate] = useState<CropRate | null>(null)
  const [editCropName, setEditCropName] = useState("")
  const [editRate, setEditRate] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)

  const handleAdd = async () => {
    if (!newCropName.trim() || !newRate) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      await addCropRate({
        name: newCropName.trim(),
        nameUrdu: newCropName.trim(),
        rate: Number(newRate),
        unit: "40kg (Maund)",
        location: "Galla Mandi",
        trend: "stable",
        isActive: newIsActive,
        updatedAt: new Date().toISOString()
      })
      toast.success("Crop rate added successfully")
      setIsAddOpen(false)
      setNewCropName("")
      setNewRate("")
      setNewIsActive(true)
    } catch (err) {
      toast.error("Failed to add crop rate")
    }
  }

  const handleEditClick = (rate: CropRate) => {
    setEditingRate(rate)
    setEditCropName(rate.name)
    setEditRate(String(rate.rate))
    setEditIsActive(rate.isActive ?? true)
    setIsEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingRate) return
    if (!editCropName.trim() || !editRate) {
      toast.error("Please fill in all fields")
      return
    }
    try {
      await updateCropRate(editingRate.id, {
        name: editCropName.trim(),
        nameUrdu: editCropName.trim(),
        rate: Number(editRate),
        isActive: editIsActive,
      })
      toast.success("Crop rate updated")
      setIsEditOpen(false)
      setEditingRate(null)
    } catch (err) {
      toast.error("Failed to update crop rate")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop rate?")) return
    try {
      await deleteCropRate(id)
      toast.success("Crop rate deleted")
    } catch (err) {
      toast.error("Failed to delete crop rate")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Agriculture Crop Rates</h2>
          <p className="text-sm text-muted-foreground">Manage the market rates displayed to customers on the homepage</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-11 gap-2 font-semibold">
              <Plus className="h-5 w-5" /> Add Crop Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-sm bg-card">
            <DialogHeader>
              <DialogTitle>Add New Crop Rate</DialogTitle>
              <DialogDescription>Set the per-maund rate for a crop.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Crop Name (e.g. WHEAT)</Label>
                <Input value={newCropName} onChange={(e) => setNewCropName(e.target.value.toUpperCase())} placeholder="e.g. WHEAT" />
              </div>
              <div className="space-y-1">
                <Label>Rate (PKR / Maund)</Label>
                <Input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} placeholder="e.g. 3900" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="new-active" 
                  checked={newIsActive} 
                  onChange={(e) => setNewIsActive(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="new-active" className="cursor-pointer">Active (Visible to customers)</Label>
              </div>
              <Button className="w-full mt-4" onClick={handleAdd}>
                Add Crop Rate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl overflow-hidden border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="font-bold py-4 pl-6">Crop Name</TableHead>
              <TableHead className="font-bold">Rate (PKR/Maund)</TableHead>
              <TableHead className="font-bold">Last Updated</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cropRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No crop rates added yet.
                </TableCell>
              </TableRow>
            ) : (
              cropRates.map((cr) => (
                <TableRow key={cr.id}>
                  <TableCell className="font-bold py-4 pl-6">{cr.name}</TableCell>
                  <TableCell className="font-semibold text-primary">Rs. {cr.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {cr.updatedAt ? new Date(cr.updatedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cr.isActive !== false ? "default" : "secondary"} className="rounded-full text-[10px]">
                      {cr.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right space-x-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleEditClick(cr)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(cr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-2xl max-w-sm bg-card">
          <DialogHeader>
            <DialogTitle>Edit Crop Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Crop Name</Label>
              <Input value={editCropName} onChange={(e) => setEditCropName(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1">
              <Label>Rate (PKR / Maund)</Label>
              <Input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="edit-active" 
                checked={editIsActive} 
                onChange={(e) => setEditIsActive(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">Active (Visible to customers)</Label>
            </div>
            <Button className="w-full mt-4" onClick={handleEditSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
