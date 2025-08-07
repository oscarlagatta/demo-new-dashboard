import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

function PaymentSearchBox() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Search for a transaction</CardTitle>
                    <CardDescription>You can search for a transaction by ID, Amount, or Date Range.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end max-w-4xl">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="transaction-id">Transaction ID</Label>
                            <Input type="text" id="transaction-id" placeholder="Enter Transaction ID" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="transaction-amount">Transaction Amount</Label>
                            <Input type="text" id="transaction-amount" placeholder="Enter Amount" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="date-start">Date Range (Start)</Label>
                            <Input type="date" id="date-start" />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="date-end">Date Range (End)</Label>
                            <Input type="date" id="date-end" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PaymentSearchBox;
