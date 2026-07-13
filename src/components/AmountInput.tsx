import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Match {
  id: string;
  name: string;
  location: string;
}

interface AmountInputProps {
  exchangeType: 'cash-to-upi' | 'upi-to-cash';
  onBack: () => void;
  onFindMatch: (amount: number, location: string) => Promise<void>;
  isCreatingRequest: boolean;
}

export default function AmountInput({ exchangeType, onBack, onFindMatch, isCreatingRequest }: AmountInputProps) {
  const [amount, setAmount] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Map amounts to names/locations for prototype
  const matchData: Record<number, Match[]> = {
    100: [
      { id: "1", name: "Venkata Sai", location: "Central Library" },
      { id: "2", name: "Rajesh Kumar", location: "Main Canteen" },
      { id: "3", name: "Akhil Pasupaleti", location: "Study Hall" }
    ],
    200: [
      { id: "4", name: "Arjun Reddy", location: "Sports Complex" },
      { id: "5", name: "Sneha Singh", location: "Hostel Block A" },
      { id: "6", name: "Priya Patel", location: "Computer Lab" }
    ],
    500: [
      { id: "7", name: "Rahul Sharma", location: "Main Gate" },
      { id: "8", name: "Kavya Nair", location: "Lecture Hall 1" },
      { id: "9", name: "Amit Kumar", location: "Admin Block" }
    ],
    1000: [
      { id: "10", name: "Deepak Verma", location: "Cafeteria" },
      { id: "11", name: "Anita Gupta", location: "Medical Center" },
      { id: "12", name: "Sanjay Patel", location: "Engineering Block" }
    ],
    50: [
      { id: "13", name: "Ravi Joshi", location: "Parking Area" },
      { id: "14", name: "Meera Das", location: "Art Gallery" },
      { id: "15", name: "Kiran Shah", location: "Auditorium" }
    ]
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseInt(value);
    setShowPreview(numAmount > 0 && !!matchData[numAmount]);
  };

  const handleFindMatch = () => {
    const numAmount = parseInt(amount);
    if (numAmount > 0 && location) {
      onFindMatch(numAmount, location);
    }
  };

  const currentMatches = matchData[parseInt(amount)] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enter Amount</h2>
          <p className="text-muted-foreground">
            {exchangeType === 'cash-to-upi' ? 'I have cash, need UPI' : 'I have UPI, need cash'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Central Library">Central Library</SelectItem>
              <SelectItem value="lake Veiw">lake Veiw</SelectItem>
              <SelectItem value="Tea Leaf">Tea Leaf</SelectItem>
              <SelectItem value="COE">COE</SelectItem>
              <SelectItem value="A Block">A Block</SelectItem>
              <SelectItem value="B Block">B Block</SelectItem>
              <SelectItem value="C Block">C Block</SelectItem>
              <SelectItem value="Admission hub">Admission hub</SelectItem>
              <SelectItem value="Canal Gate">Canal Gate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
  onClick={async () => {
    const numAmount = parseInt(amount);
    if (numAmount > 0 && location) {
      await onFindMatch(numAmount, location);
    }
  }}
  disabled={!amount || parseInt(amount) <= 0 || !location || isCreatingRequest}
  className="w-full"
>
  {isCreatingRequest ? "Creating Request..." : "Find Match"}
</Button>


      </div>
    </div>
  );
}
