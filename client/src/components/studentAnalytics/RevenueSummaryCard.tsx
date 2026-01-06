import { Card } from "@/components/ui/card";

export default function RevenueSummaryCard({
  summary,
}: {
  summary: any;
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">
        Revenue Summary
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>Mess Spent: ₹{summary.totalMessSpent}</div>
        <div>Wallet Earned: ₹{summary.totalWalletCredit}</div>
        <div>Food Court: ₹{summary.totalFoodCourtSpent}</div>
        <div className="font-semibold">
          Net Wallet: ₹{summary.netWalletChange}
        </div>
      </div>
    </Card>
  );
}
