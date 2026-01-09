import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { applyMessManager } from "@/api/mess.api";

export default function ApplyMessManager() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    messName: "",
    campusType: "BOTH",
    foodType: "BOTH",

    prices: {
      breakfast: "",
      lunch: "",
      snacks: "",
      dinner: "",
      grandDinner: "",
    },

    penaltyPercent: 0,

    grandDinnerDaysPerMonth: 2,


    operation: {
      startDate: "",
      endDate: "",
    },
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (e: any) => {
    setForm({
      ...form,
      prices: {
        ...form.prices,
        [e.target.name]: e.target.value,
      },
    });
  };

  const submit = async () => {
    try {
      setLoading(true);
      await applyMessManager(form);
      alert("Mess application submitted for hostel office approval");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen bg-gradient-to-b from-muted/40 to-muted/20 py-12 px-4">
    <Card className="max-w-4xl mx-auto rounded-3xl shadow-lg border">
      <CardContent className="p-10 space-y-10">

        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Mess Management Application
          </h1>
          <p className="text-muted-foreground text-sm">
            Submit mess configuration for hostel office approval
          </p>
        </div>

        <Separator />

        {/* BASIC INFO */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <p className="text-sm text-muted-foreground">
              Details visible to students and hostel office
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input name="email" onChange={handleChange} />
            </div>

            <div className="space-y-1.5">
              <Label>Mess Name</Label>
              <Input name="messName" onChange={handleChange} />
            </div>
          </div>

          <div className="max-w-md space-y-1.5">
            <Label>Campus</Label>
            <select
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#6770d2]/40"
              value={form.campusType}
              onChange={(e) =>
                setForm({ ...form, campusType: e.target.value })
              }
            >
              <option value="BOYS">Boys Campus</option>
              <option value="GIRLS">Girls Campus</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </section>

        <Separator />

        {/* FOOD TYPE */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Food Type</h2>
            <p className="text-sm text-muted-foreground">
              Helps students filter messes by preference
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Veg", value: "VEG" },
              { label: "Non-Veg", value: "NON_VEG" },
              { label: "Both", value: "BOTH" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm({ ...form, foodType: opt.value })
                }
                className={`px-5 py-2 rounded-xl border text-sm font-medium transition
                  ${
                    form.foodType === opt.value
                      ? "bg-[#6770d2] text-white border-[#6770d2] shadow"
                      : "bg-background hover:bg-muted"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* MEAL PRICING */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Meal Pricing (₹)</h2>
            <p className="text-sm text-muted-foreground">
              Per-meal cost used for billing and wallet credits
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              ["breakfast", "Breakfast"],
              ["lunch", "Lunch"],
              ["snacks", "Snacks"],
              ["dinner", "Dinner"],
              ["grandDinner", "Grand Dinner"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  type="number"
                  name={key}
                  onChange={handlePriceChange}
                />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* PENALTY */}
        <section className="space-y-3 max-w-md">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Penalty Rule</h2>
            <p className="text-sm text-muted-foreground">
              Applied when a student does not cancel and skips a meal
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>No-show Penalty (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.penaltyPercent}
              onChange={(e) =>
                setForm({ ...form, penaltyPercent: Number(e.target.value) })
              }
            />
          </div>
        </section>

        <Separator />

        {/* GRAND DINNER */}
        <section className="space-y-3 max-w-md">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Grand Dinner</h2>
            <p className="text-sm text-muted-foreground">
              Special meals served on selected days
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Grand Dinner Days per Month</Label>
            <Input
              type="number"
              min={0}
              max={31}
              placeholder="e.g. 2"
              value={form.grandDinnerDaysPerMonth}
              onChange={(e) =>
                setForm({
                  ...form,
                  grandDinnerDaysPerMonth: Number(e.target.value),
                })
              }
            />
          </div>
        </section>

        <Separator />

        {/* OPERATION PERIOD */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Operation Period</h2>
            <p className="text-sm text-muted-foreground">
              Duration for which this mess configuration is valid
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                onChange={(e) =>
                  setForm({
                    ...form,
                    operation: {
                      ...form.operation,
                      startDate: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                onChange={(e) =>
                  setForm({
                    ...form,
                    operation: {
                      ...form.operation,
                      endDate: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* SUBMIT */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={submit}
            disabled={loading}
            className="bg-[#6770d2] hover:bg-[#5b63c7] px-10 py-2.5 rounded-xl shadow-md"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>

      </CardContent>
    </Card>
  </div>
);

}
