"use client";

import { Mail, Search } from "lucide-react";
import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ShowcaseSection } from "./showcase-section";

const FRUITS = [
  { value: "apple", label: "Apple", description: "Crisp and sweet" },
  { value: "banana", label: "Banana", description: "Soft and creamy" },
  { value: "cherry", label: "Cherry", description: "Small and tart" },
  { value: "durian", label: "Durian", description: "Out of season", disabled: true },
];

export function InputsShowcase() {
  const id = useId();
  const [volume, setVolume] = useState(40);
  const [notify, setNotify] = useState(true);

  return (
    <>
      <ShowcaseSection
        title="Text inputs"
        description="Labels, hints, adornments, invalid and disabled states."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Email" description="We'll never share it.">
            {(f) => (
              <Input {...f} type="email" placeholder="you@company.com" startAdornment={<Mail />} />
            )}
          </FormField>
          <FormField label="Search">
            {(f) => (
              <Input {...f} type="search" placeholder="Search…" startAdornment={<Search />} />
            )}
          </FormField>
          <FormField label="Username" error="This username is already taken">
            {(f) => <Input {...f} defaultValue="admin" />}
          </FormField>
          <FormField label="Disabled">
            {(f) => <Input {...f} disabled defaultValue="Read only value" />}
          </FormField>
          <FormField label="Bio" className="sm:col-span-2">
            {(f) => <Textarea {...f} placeholder="Tell us a little about yourself" />}
          </FormField>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Selection controls"
        description="Custom listbox select, native select, checkbox, radio, switch and slider."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Custom select">
            {(f) => <Select {...f} options={FRUITS} placeholder="Pick a fruit" />}
          </FormField>
          <FormField label="Native select">
            {(f) => (
              <NativeSelect
                {...f}
                placeholder="Choose a region"
                options={[
                  { value: "eu", label: "Europe" },
                  { value: "us", label: "United States" },
                  { value: "ap", label: "Asia Pacific" },
                ]}
              />
            )}
          </FormField>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-4">
            <Checkbox
              id={`${id}-terms`}
              label="Accept terms"
              description="Required to continue."
              defaultChecked
            />
            <Checkbox id={`${id}-news`} label="Product updates" />
            <Checkbox id={`${id}-off`} label="Disabled option" disabled />
          </div>
          <RadioGroup
            legend="Plan"
            name={`${id}-plan`}
            defaultValue="team"
            options={[
              { value: "starter", label: "Starter", description: "Up to 5 seats" },
              { value: "team", label: "Team", description: "Up to 50 seats" },
              {
                value: "enterprise",
                label: "Enterprise",
                description: "Contact sales",
                disabled: true,
              },
            ]}
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <span id={`${id}-notify`} className="text-sm font-medium">
              Email notifications
            </span>
            <Switch aria-labelledby={`${id}-notify`} checked={notify} onCheckedChange={setNotify} />
          </div>
          <Slider
            label="Volume"
            value={volume}
            onValueChange={setVolume}
            formatValue={(v) => `${String(v)}%`}
          />
        </div>
      </ShowcaseSection>
    </>
  );
}
