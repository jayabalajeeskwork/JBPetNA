"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { Loader2, Search, Check, ChevronsUpDown } from "lucide-react";
import { formatPhoneNumber } from "@/utils/formatters";
import { PET_TYPE, DOG_BREEDS, CAT_BREEDS } from "@/utils/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ownerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
});

const residenceSchema = z.object({
  municipality: z.string().min(1, "Municipality is required"),
  county: z.string().min(1, "County is required"),
  city: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

const petSchema = z.object({
  name: z.string().min(1, "Name is required"),
  petType: z.enum(["Dog", "Cat"]),
  sex: z.enum(["Male", "Female"]),
  breed: z.array(z.string()).min(1, "At least one breed is required").max(2),
  age: z.string().min(1, "Age is required"),
});

type EditDetailsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "owner" | "pet" | "residence";
  data: any;
};

// Reusable Searchable Dropdown for Dialog
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { _id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-[46px] w-full justify-between rounded-[12px] border-[#E5E7EB] font-normal"
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-center text-muted-foreground">No options found.</div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt._id}
                onClick={() => {
                  onChange(opt._id);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                  value === opt._id && "bg-accent text-accent-foreground"
                )}
              >
                <Check className={cn("mr-2 h-4 w-4", value === opt._id ? "opacity-100" : "opacity-0")} />
                {opt.name}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default function EditDetailsDialog({
  isOpen,
  onOpenChange,
  type,
  data,
}: EditDetailsDialogProps) {
  const { 
    submitAcknowledgment, 
    getAcknowledgmentDetails, 
    municipalities, 
    counties,
    fetchCounties,
    fetchMunicipalities
  } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");

  const schema = type === "owner" ? ownerSchema : type === "pet" ? petSchema : residenceSchema;
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    if (isOpen) {
      if (type === "owner") {
        form.reset({
          name: data?.owner?.name || "",
          email: data?.owner?.email || "",
          phone: formatPhoneNumber(data?.owner?.phone || ""),
        });
      } else if (type === "residence") {
        form.reset({
          municipality: data?.owner?.municipality || "",
          county: data?.owner?.county || "",
          city: data?.owner?.city || "",
          address: data?.pet?.address || data?.owner?.address || "",
        });
      } else if (type === "pet") {
        let breeds: string[] = [];
        if (Array.isArray(data?.pet?.breed)) {
          breeds = data.pet.breed;
        } else if (typeof data?.pet?.breed === "string") {
          breeds = data.pet.breed.split(",").map((s: string) => s.trim());
        }

        form.reset({
          name: data?.pet?.name || "",
          petType: data?.pet?.type === 2 || data?.pet?.petType === "Cat" ? "Cat" : "Dog",
          sex: data?.pet?.sex === 1 || data?.pet?.sex === "Male" ? "Male" : "Female",
          breed: breeds,
          age: data?.pet?.age?.toString() || "",
        });
      }
    }
  }, [isOpen, type, data, form]);

  useEffect(() => {
    if (isOpen && type === "residence") {
      fetchCounties();
      fetchMunicipalities(500);
    }
  }, [isOpen, type, fetchCounties, fetchMunicipalities]);

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    const acknowledgementId = data?._id || data?.id;

    let payload: any = {
      acknowledgementId,
    };

    if (type === "owner") {
      payload = {
        ...payload,
        type: 1,
        name: values.name,
        email: values.email,
        phone: values.phone.replace(/\D/g, ""),
        municipality: data?.owner?.municipality,
        county: data?.owner?.county,
      };
    } else if (type === "residence") {
      payload = {
        ...payload,
        type: 1,
        name: data?.owner?.name,
        email: data?.owner?.email,
        phone: data?.owner?.phone,
        municipality: values.municipality,
        county: values.county,
        city: values.city,
        address: values.address,
      };
    } else if (type === "pet") {
      payload = {
        ...payload,
        type: 2,
        name: values.name,
        petType: values.petType === "Dog" ? PET_TYPE.DOG : PET_TYPE.CAT,
        sex: values.sex === "Male" ? 1 : 2,
        breed: values.breed,
        age: parseInt(values.age),
        address: data?.pet?.address || data?.owner?.address,
      };
    }

    const res = await submitAcknowledgment(payload);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Updated successfully");
      const token = new URLSearchParams(window.location.search).get("token") || data?.token;
      if (token) getAcknowledgmentDetails(token);
      onOpenChange(false);
    } else {
      toast.error(res.error || "Update failed");
    }
  };

  const currentPetType = form.watch("petType");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] rounded-[20px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-[#14181F]">
            Edit {type === "owner" ? "Owner Info" : type === "pet" ? "Pet Info" : "Residence Details"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {type === "owner" && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-[46px] rounded-[12px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-[46px] rounded-[12px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                          className="h-[46px] rounded-[12px]" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type === "residence" && (
              <>
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County</FormLabel>
                      <FormControl>
                        <SearchableDropdown
                          options={counties}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select County"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="municipality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipality</FormLabel>
                      <FormControl>
                        <SearchableDropdown
                          options={municipalities}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Municipality"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-[46px] rounded-[12px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-[46px] rounded-[12px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type === "pet" && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-[46px] rounded-[12px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="petType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Type</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === "Dog" ? "default" : "outline"}
                          onClick={() => {
                            field.onChange("Dog");
                            form.setValue("breed", []);
                          }}
                          className={cn("h-[46px] rounded-[12px]", field.value === "Dog" && "bg-[#03838C]")}
                        >
                          Dog
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "Cat" ? "default" : "outline"}
                          onClick={() => {
                            field.onChange("Cat");
                            form.setValue("breed", []);
                          }}
                          className={cn("h-[46px] rounded-[12px]", field.value === "Cat" && "bg-[#03838C]")}
                        >
                          Cat
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breed"
                  render={() => (
                    <FormItem>
                      <FormLabel>Breed (up to 2)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex min-h-[46px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
                            {form.watch("breed").length > 0 ? (
                              form.watch("breed").map((b: string) => (
                                <span key={b} className="inline-flex items-center gap-1 rounded bg-[#03838C]/10 px-2 py-1 text-xs font-medium text-[#03838C]">
                                  {b}
                                  <Check className="h-3 w-3" />
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Select breed...</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search breed..."
                              value={breedSearch}
                              onChange={(e) => setBreedSearch(e.target.value)}
                              className="h-8 border-0 shadow-none focus-visible:ring-0"
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto p-1">
                            {(currentPetType === "Dog" ? DOG_BREEDS : CAT_BREEDS)
                              .filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
                              .map((b) => (
                                <div
                                  key={b}
                                  onClick={() => {
                                    const current = form.watch("breed");
                                    if (current.includes(b)) {
                                      form.setValue("breed", current.filter((i: string) => i !== b));
                                    } else if (current.length < 2) {
                                      form.setValue("breed", [...current, b]);
                                    }
                                  }}
                                  className={cn(
                                    "flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                                    form.watch("breed").includes(b) && "bg-accent"
                                  )}
                                >
                                  {b}
                                  {form.watch("breed").includes(b) && <Check className="h-4 w-4" />}
                                </div>
                              ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-[46px] rounded-[12px]">
                          <SelectValue placeholder="Select Age" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((age) => (
                            <SelectItem key={age} value={age.toString()}>
                              {age} {age === 1 ? "year" : "years"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-[46px] rounded-[12px]"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-[46px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
