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
    <div className="min-h-screen bg-muted/40 py-10">
      <Card className="max-w-4xl mx-auto rounded-2xl shadow-xl">
        <CardContent className="p-8 space-y-8">

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">Mess Management Application</h1>
            <p className="text-muted-foreground">
              Submit mess configuration for hostel office approval
            </p>
          </div>

          <Separator />

          {/* BASIC INFO */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input name="email" onChange={handleChange} />
              </div>

              <div>
                <Label>Mess Name</Label>
                <Input name="messName" onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label>Campus</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
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
          <div>
  <Label>Food Type</Label>
  <div className="flex gap-3 mt-2">
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
        className={`px-4 py-2 rounded-xl border text-sm font-medium transition
          ${
            form.foodType === opt.value
              ? "bg-[#6770d2] text-white border-[#6770d2]"
              : "bg-background hover:bg-muted"
          }
        `}
      >
        {opt.label}
      </button>
    ))}
  </div>

  <p className="text-xs text-muted-foreground mt-1">
    This helps students choose mess based on dietary preference
  </p>
</div>
<Separator/>

          {/* MEAL PRICING */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Meal Pricing (₹)</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ["breakfast", "Breakfast"],
                ["lunch", "Lunch"],
                ["snacks", "Snacks"],
                ["dinner", "Dinner"],
                ["grandDinner", "Grand Dinner"],
              ].map(([key, label]) => (
                <div key={key}>
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
          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Penalty Rule</h2>

            <div className="max-w-xs">
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
              <p className="text-xs text-muted-foreground mt-1">
                Applied when student does not cancel and does not show up
              </p>
            </div>
          </section>

          <Separator />

          {/* GRAND DINNER CONFIG */}
          <section className="space-y-4">
  <h2 className="text-xl font-semibold">Grand Dinner</h2>

  <div className="max-w-xs space-y-1">
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
    <p className="text-xs text-muted-foreground">
      Number of days in a month when Grand Dinner is served
    </p>
  </div>
</section>


          <Separator />

          {/* OPERATION DATES */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Operation Period</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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

              <div>
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
          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={loading}
              className="bg-[#6770d2] hover:bg-[#5b63c7] px-8 py-2 rounded-xl"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
