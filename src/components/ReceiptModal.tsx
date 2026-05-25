import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { SaleItem } from '../App';
import { Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  receiptNumber: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  cashierName: string;
  onClose: () => void;
}

export function ReceiptModal({
  receiptNumber,
  items,
  total,
  paymentMethod,
  cashReceived,
  change,
  cashierName,
  onClose
}: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  console.log('Receipt props:', {
    paymentMethod,
    cashReceived,
    change,
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden sm:max-w-md flex flex-col"
        style={{ height: '85vh', maxHeight: '85vh' }}
      >
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt, #receipt * {
              visibility: visible;
            }
            #receipt {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            #receipt::-webkit-scrollbar {
              display: none !important;
            }
            /* Hide scrollbar for firefox in print */
            #receipt {
              scrollbar-width: none !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="p-6 pb-2 shrink-0 bg-white z-10 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
            <DialogDescription>
              Transaction receipt - {receiptNumber}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Receipt Body */}
        <div id="receipt" className="bg-white px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-4">
            <h2 className="text-xl text-gray-900 mb-1">KiraCart</h2>
            <p className="text-xs text-gray-500">Thank you for your purchase!</p>
          </div>

          {/* Receipt Info */}
          <div className="text-sm space-y-1 border-b border-gray-300 pb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt No:</span>
              <span className="text-gray-900">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cashier:</span>
              <span className="text-gray-900">{cashierName}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-b border-gray-300 pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600">Item</th>
                  <th className="text-center py-2 text-gray-600">Qty</th>
                  <th className="text-right py-2 text-gray-600">Price</th>
                  <th className="text-right py-2 text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{item.product_name}</td>
                    <td className="text-center py-2 text-gray-900">{item.quantity}</td>
                    <td className="text-right py-2 text-gray-900">₹{item.price.toFixed(2)}</td>
                    <td className="text-right py-2 text-gray-900">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="text-gray-900">{paymentMethod}</span>
            </div>

            {paymentMethod === 'Cash' && cashReceived !== undefined && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cash Received</span>
                  <span className="text-gray-900">
                    ₹{cashReceived.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Change</span>
                  <span className="text-gray-900">
                    ₹{change?.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>


          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-300">
            <p>This serves as your official receipt</p>
            <p className="mt-1">For concerns, please contact us</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 pt-4 shrink-0 bg-white border-t border-gray-100 z-10">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="size-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={onClose} className="flex-1">
              <X className="size-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}