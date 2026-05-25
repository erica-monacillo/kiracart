import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SaleItem } from '../App';
import { CreditCard, Wallet, IndianRupee, Receipt } from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

interface PaymentModalProps {
  total: number;
  cart: SaleItem[];
  cashierName: string;
  onClose: () => void;
  onPaymentComplete: (sale: {
    paymentMethod: string;
    total: number;
    items: SaleItem[];
    cashReceived?: number;
    change?: number;
  }) => void;
}


export function PaymentModal({ total, cart, cashierName, onClose, onPaymentComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paytm' | 'card'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [paytmNumber, setPaytmNumber] = useState('');
  const [paytmReference, setPaytmReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const cashChange = cashAmount ? parseFloat(cashAmount) - total : 0;

  const handlePayment = () => {
    if (!cart.length) return;
  
    if (paymentMethod === 'cash') {
      if (!cashAmount || parseFloat(cashAmount) < total) {
        alert('Insufficient cash amount!');
        return;
      }
    }
  
    if (paymentMethod === 'paytm') {
      if (!paytmNumber || !paytmReference) {
        alert('Please enter Paytm number and reference!');
        return;
      }
    }
  
    if (paymentMethod === 'card') {
      if (!cardNumber) {
        alert('Please enter card number!');
        return;
      }
    }
  
    setReceiptNumber(`RCP-${Date.now()}`);
  
    // THIS IS THE IMPORTANT PART
    onPaymentComplete({
      paymentMethod:
        paymentMethod === 'cash'
          ? 'Cash'
          : paymentMethod === 'paytm'
          ? `Paytm (${paytmNumber})`
          : `Card (**** ${cardNumber.slice(-4)})`,
      total,
      items: cart,
      cashReceived: paymentMethod === 'cash' ? Number(cashAmount) : undefined,
      change: paymentMethod === 'cash' ? cashChange : undefined,
    });
    
  
    setShowReceipt(true);
  };
  

  const handleReceiptClose = () => {
    setShowReceipt(false);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-[#D1EDC5]">
        <DialogHeader>
          <DialogTitle className="text-[#1a5a1a]">Payment</DialogTitle>
          <DialogDescription>
            Select a payment method and complete the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0] rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-[#1a5a1a]">Total Amount</span>
            <span className="text-2xl text-[#1a5a1a]">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <Tabs value={paymentMethod} onValueChange={(v: string) => setPaymentMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3 bg-[#f0f9ed]">
            <TabsTrigger value="cash" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">
              <IndianRupee  className="size-4 mr-1" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="paytm" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">
              <Wallet className="size-4 mr-1" />
              Paytm
            </TabsTrigger>
            <TabsTrigger value="card" className="data-[state=active]:bg-[#D1EDC5] data-[state=active]:text-[#1a5a1a]">
              <CreditCard className="size-4 mr-1" />
              Card
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Cash Amount</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="border-[#D1EDC5]"
              />
            </div>

            {cashAmount && parseFloat(cashAmount) >= total && (
              <div className="p-3 bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0] rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[#1a5a1a]">Change</span>
                  <span className="text-xl text-[#1a5a1a]">₹{cashChange.toFixed(2)}</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="paytm" className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                Ask customer to send ₹{total.toFixed(2)} to your Paytm number and provide the reference number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paytmNumber">Customer Paytm Number</Label>
              <Input
                id="paytmNumber"
                type="tel"
                placeholder="09XX XXX XXXX"
                value={paytmNumber}
                onChange={(e) => setPaytmNumber(e.target.value)}
                className="border-[#D1EDC5]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gcashReference">Reference Number</Label>
              <Input
                id="gcashReference"
                type="text"
                placeholder="Enter reference number"
                value={paytmReference}
                onChange={(e) => setPaytmReference(e.target.value)}
                className="border-[#D1EDC5]"
              />
            </div>
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-800">
                Process card payment of ₹{total.toFixed(2)} through your card terminal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number (Last 4 digits)</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="****"
                maxLength={4}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="border-[#D1EDC5]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-[#D1EDC5] text-[#1a5a1a] hover:bg-[#f0f9ed]">
            Cancel
          </Button>
          <Button onClick={handlePayment} className="flex-1 bg-gradient-to-r from-[#D1EDC5] to-[#a8dfa0] hover:from-[#a8dfa0] hover:to-[#7fcd77] text-[#1a5a1a]">
            <Receipt className="size-4 mr-2" />
            Complete Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}