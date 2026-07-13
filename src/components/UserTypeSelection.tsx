import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Smartphone, Banknote } from "lucide-react";

interface UserTypeSelectionProps {
  onSelectType: (type: 'cash-to-upi' | 'upi-to-cash') => void;
}

export default function UserTypeSelection({ onSelectType }: UserTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">What do you need?</h2>
        <p className="text-muted-foreground">Choose your exchange type to find a perfect match</p>
      </div>
      
      <div className="grid gap-4">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] border-2 hover:border-primary/20 cursor-pointer group" 
              onClick={() => onSelectType('upi-to-cash')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">I have UPI money</h3>
                <p className="text-sm text-muted-foreground">Want to get physical cash</p>
                <p className="text-xs text-primary font-medium mt-1">Type 1 Student</p>
              </div>
              <div className="flex-shrink-0">
                <ArrowUpDown className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-shrink-0">
                <Banknote className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] border-2 hover:border-secondary/20 cursor-pointer group" 
              onClick={() => onSelectType('cash-to-upi')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-green-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">I have cash</h3>
                <p className="text-sm text-muted-foreground">Want to send via UPI</p>
                <p className="text-xs text-secondary font-medium mt-1">Type 2 Student</p>
              </div>
              <div className="flex-shrink-0">
                <ArrowUpDown className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
     
    </div>
  );
}