"use client";
import { useState } from "react";
import { createPledge } from "@/app/actions";
export function PledgeForm({ campaignId }: { campaignId: string }) {
  const [message, setMessage] = useState("");
  return (
    <form
      className="mt-7 border-t border-slate-200 pt-5"
      action={async (data) => {
        try {
          await createPledge(campaignId, data);
          setMessage("Your pledge was recorded.");
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Could not record pledge.",
          );
        }
      }}
    >
      <label className="field-label" htmlFor="amount">
        Your pledge (GHS)
      </label>
      <input
        className="field"
        id="amount"
        name="amount"
        min="1"
        step="0.01"
        type="number"
        required
        placeholder="0.00"
      />
      <button className="button button-primary mt-3 w-full" type="submit">
        Record pledge
      </button>
      {message && (
        <p className="mt-3 text-sm text-slate-600" role="status">
          {message}
        </p>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        PROMESA records a pledge; it does not collect a payment.
      </p>
    </form>
  );
}
