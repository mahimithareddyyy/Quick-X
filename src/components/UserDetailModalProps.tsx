import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Star, MapPin, Clock } from "lucide-react";

interface UserDetailModalProps {
  req: any; // Pass the entire request object
  open: boolean;
  onClose: () => void;
}

export default function UserDetailModal({ req, open, onClose }: UserDetailModalProps) {
  const user = req.user || {};
  
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Exchange Partner Details</DialogTitle>
          <DialogDescription>
            Information about this partner and the request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 my-4">
          <Avatar className="w-24 h-24 ring-2 ring-primary shadow-lg">
            <AvatarFallback>
              {user.firstName?.charAt(0) || "U"}
              {user.lastName?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-bold">
            {user.firstName || "User"} {user.lastName || ""}
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-medium text-sm">{user.trustScore ?? 4.8}</span>
            <span className="text-xs text-muted-foreground">
              ({user.reviews ?? 24} reviews)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{req.location || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{req.user.phoneNumber}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-3 text-sm">
            <span className="font-semibold">Amount:</span> ₹{req.money}
          </div>
        </div>

        <DialogFooter className="flex justify-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
