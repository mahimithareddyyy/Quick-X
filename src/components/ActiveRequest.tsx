import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface ActiveRequest {
  id: string;
  collectionName: string;
  createdBy: string;
  money: number;
  location: string;
  status: string;
  createdAt: any;
}

interface ActiveRequestsProps {
  onShowPeople: (amount: number, location: string, collectionName: string) => void;
}


export default function ActiveRequests({ onShowPeople }: ActiveRequestsProps  ) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ActiveRequest[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribers: (() => void)[] = [];

    ["type1Requests", "type2Requests"].forEach((collectionName) => {
      const q = query(
        collection(db, collectionName),
        where("createdBy", "==", user.uid),
        where("status", "==", "active")
      );

      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(
          (d) =>
            ({
              id: d.id,
              collectionName,
              ...d.data(),
            } as ActiveRequest)
        );


        setRequests((prev) => {
          // remove old entries for this collection only
          const others = prev.filter((r) => r.collectionName !== collectionName);
          return [...others, ...data];
        });

        setLoading(false);
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [user?.uid]);

  const updateStatus = async (
    collectionName: string,
    id: string,
    status: string
  ) => {
    try {
      await updateDoc(doc(db, collectionName, id), { status });
    } catch (err) {
      console.error("[ActiveRequests] ❌ Failed to update:", err);
    }
  };

  const deleteRequest = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error("[ActiveRequests] ❌ Failed to delete:", err);
    }
  };

  const formatTime = (value: any): string => {
    try {
      const d = value?.toDate ? value.toDate() : new Date(value);
      return d.toLocaleTimeString();
    } catch {
      return "";
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading your active requests...</p>;
  }

  if (requests.length === 0) {
    return <p className="text-muted-foreground">You don’t have any active requests.</p>;
  }

  return (
    <div className="space-y-3 pt-4">
      <h2 className="text-2xl font-bold text-primary">Active Requests</h2>
      {requests.map((req) => {
        // Determine what the user needs based on the collection
        const isType1 = req.collectionName === "type1Requests";
        const needText = isType1 ? "Need Cash" : "Need UPI";
        const needIcon = isType1 ? "💵" : "📱";
        const statusColor = req.status === "active" ? "bg-green-100 text-green-800 border-green-200" : 
                           req.status === "cancelled" ? "bg-red-100 text-red-800 border-red-200" : 
                           "bg-blue-100 text-blue-800 border-blue-200";
  
        return (
          <Card key={req.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Main Info Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">₹{req.money}</span>
                      <Badge 
                        className={`${statusColor} text-xs font-medium px-2 py-1 rounded-full`}
                        variant="outline"
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
  
                  {/* Details Grid */}
                  <div className="flex gap-8 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>{req.location || "Location not specified"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{formatTime(req.createdAt)}</span>
                    </div>
                  </div>
  
                  {/* Need Type Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      isType1 ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      <span>{needIcon}</span>
                      <span>{needText}</span>
                    </div>
                  </div>
                </div>
  
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(req.collectionName, req.id, "cancelled")}
                    className="hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700 transition-colors"
                    disabled={req.status !== "active"}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => updateStatus(req.collectionName, req.id, "completed")}
                    className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={req.status !== "active"}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Done</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRequest(req.collectionName, req.id)}
                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
  
              {/* Status Progress Indicator */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: {req.status}</span>
                  <div className="flex items-center gap-2">
                    {req.status === "active" && (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium">Looking for matches...</span>
                      </>
                    )}
                    {req.status === "completed" && (
                      <>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-600 font-medium">Exchange completed</span>
                      </>
                    )}
                    {req.status === "cancelled" && (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 font-medium">Request cancelled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowPeople(req.money, req.location, req.collectionName || "")}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  disabled={req.status !== "active"}
                >
                  👥 Show People
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
       <div className="text-center">
        <p className="text-xs text-muted-foreground">Secure • Fast • Campus-verified</p>
      </div>
    </div>
  );}
