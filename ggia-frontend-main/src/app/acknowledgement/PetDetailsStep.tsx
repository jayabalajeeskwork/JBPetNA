import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useStore } from "@/stores/useStore";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DOG_BREEDS, CAT_BREEDS, PET_TYPE } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  petType: z.enum(["Dog", "Cat"]),
  sex: z.enum(["Male", "Female"]),
  breed: z.array(z.string()).min(1, "At least one breed is required").max(2, "Maximum 2 breeds allowed"),
  age: z.string().min(1, "Age is required"),
  address: z.string().min(1, "Address is required"),
});

type FormValues = z.infer<typeof formSchema>;

type PetDetailsStepProps = {
  token?: string;
  onBack: () => void;
  onContinue: () => void;
};

const PetDetailsStep = ({ token, onBack, onContinue }: PetDetailsStepProps) => {
  const [breedSearch, setBreedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledgementId, setAcknowledgementId] = useState("");
  const { submitAcknowledgment, getAcknowledgmentDetails, acknowledgmentDetails } = useStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      petType: "Dog",
      sex: "Male",
      breed: [],
      age: "",
      address: "",
    },
  });

  const { watch, setValue, handleSubmit, control } = form;
  const currentPetType = watch("petType");

  // Fetch initial data if not present
  useEffect(() => {
    if (token && !acknowledgmentDetails) {
      getAcknowledgmentDetails(token);
    }
  }, [token, getAcknowledgmentDetails, acknowledgmentDetails]);

  // Pre-fill from state
  useEffect(() => {
    if (acknowledgmentDetails?.pet) {
      const pet = acknowledgmentDetails.pet;
      setAcknowledgementId(acknowledgmentDetails._id || acknowledgmentDetails.id || "");
      
      let parsedBreed: string[] = [];
      if (Array.isArray(pet.breed)) {
        parsedBreed = pet.breed;
      } else if (typeof pet.breed === "string") {
        parsedBreed = pet.breed.split(",").map((s: string) => s.trim());
      }

      // Ensure age is a clean numeric string to match Select options
      const ageStr = pet.age != null ? pet.age.toString().replace(/[^0-9]/g, "") : "";

      form.reset({
        name: pet.name || "",
        petType: pet.type === PET_TYPE.DOG || pet.type === "Dog" ? "Dog" : "Cat",
        sex: pet.sex === 1 || pet.sex === "Male" ? "Male" : "Female",
        breed: parsedBreed,
        age: ageStr,
        address: pet.address || "",
      });
    }
  }, [acknowledgmentDetails, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const payload = {
      type: 2, // acknowledgmentType.PET_INFO
      acknowledgementId: acknowledgementId || undefined,
      name: values.name,
      petType: values.petType === "Dog" ? PET_TYPE.DOG : PET_TYPE.CAT,
      sex: values.sex === "Male" ? 1 : 2,
      breed: values.breed,
      age: parseInt(values.age),
      address: values.address,
    };

    const response = await submitAcknowledgment(payload);

    setIsSubmitting(false);

    if (response.success) {
      if (token) getAcknowledgmentDetails(token);
      toast.success("Pet details submitted successfully!");
      onContinue();
    } else {
      toast.error(response.error || "Submission failed");
    }
  };

  return (
    <Card className="w-full max-w-[640px] mt-[32px] border-0 sm:p-[38px] p-[18px] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_-2px_rgba(0,0,0,0.06)] rounded-[16px] bg-[#fff0] overflow-hidden">
      <CardHeader className="flex sm:flex-row flex-col sm:items-center items-start justify-between p-0">
        <CardTitle className="sm:text-[24px] text-[18px] font-[700] text-[#171717]">Tell us about your pet</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-[24px]">
        <Form {...form} key={acknowledgementId}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Pet Name"
                      className="h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] sm:text-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="petType"
              render={({ field }) => (
                <FormItem className="space-y-[8px]">
                  <FormLabel className="text-[14px] font-medium text-[#14181F]">
                    Pet Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-[12px]">
                      <Button
                        type="button"
                        onClick={() => {
                          field.onChange("Dog");
                          setValue("breed", [], { shouldValidate: true });
                        }}
                        className={cn(
                          "flex items-center justify-center gap-2 h-[46px] rounded-[12px] font-medium cursor-pointer",
                          field.value === "Dog" ? "bg-[#03838C] text-white hover:bg-[#036b73]" : "border border-input text-[#14181F] bg-transparent hover:bg-[#F5F5F5]"
                        )}
                      >
                        Dog
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          field.onChange("Cat");
                          setValue("breed", [], { shouldValidate: true });
                        }}
                        className={cn(
                          "flex items-center justify-center gap-2 h-[46px] rounded-[12px] font-medium cursor-pointer",
                          field.value === "Cat" ? "bg-[#03838C] text-white hover:bg-[#036b73]" : "border border-input text-[#14181F] bg-transparent hover:bg-[#F5F5F5]"
                        )}
                      >
                        Cat
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="sex"
              render={({ field }) => (
                <FormItem className="space-y-[8px]">
                  <FormLabel className="text-[14px] font-medium text-[#14181F]">
                    Sex <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-[12px]">
                      <Button
                        type="button"
                        onClick={() => field.onChange("Male")}
                        className={cn(
                          "h-[46px] rounded-[12px] font-medium cursor-pointer",
                          field.value === "Male" ? "bg-[#03838C] text-white hover:bg-[#036b73]" : "border border-input text-[#627084] bg-transparent hover:bg-[#F5F5F5]"
                        )}
                      >
                        Male
                      </Button>
                      <Button
                        type="button"
                        onClick={() => field.onChange("Female")}
                        className={cn(
                          "h-[46px] rounded-[12px] font-medium cursor-pointer",
                          field.value === "Female" ? "bg-[#03838C] text-white hover:bg-[#036b73]" : "border border-input text-[#627084] bg-transparent hover:bg-[#F5F5F5]"
                        )}
                      >
                        Female
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="breed"
              render={() => (
                <FormItem className="space-y-[6px]">
                  <FormLabel className="text-[14px] font-medium text-[#14181F]">
                    Breed <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex min-h-[46px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] py-2 pl-[36px] text-[14px] sm:text-[16px]">
                            <span className="absolute left-3 top-[1.4rem] -translate-y-1/2">
                              <Search className="h-4 w-4 text-[#9CA3AF]" />
                            </span>
                            {watch("breed").length > 0 ? (
                              watch("breed").map((b) => (
                                <span key={b} className="inline-flex items-center gap-1 rounded-md bg-[#04838C]/10 px-2 py-1 text-[12px] font-medium text-[#04838C]">
                                  {b}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = watch("breed");
                                      setValue("breed", current.filter((item) => item !== b), { shouldValidate: true });
                                    }}
                                  />
                                </span>
                              ))
                            ) : (
                              <span className="text-[#9CA3AF]">Search for breed (up to 2)</span>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <div className="flex flex-col">
                            <div className="border-b p-2">
                              <Input
                                placeholder="Type to search..."
                                value={breedSearch}
                                onChange={(e) => setBreedSearch(e.target.value)}
                                className="h-9 border-0 focus-visible:ring-0"
                                autoFocus
                              />
                            </div>
                            <div className="premium-scrollbar max-h-[200px] overflow-y-auto p-1" onWheel={(e) => e.stopPropagation()}>
                              {(currentPetType === "Dog" ? DOG_BREEDS : CAT_BREEDS)
                                .filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
                                .map((b) => {
                                  const isSelected = watch("breed").includes(b);
                                  const currentBreeds = watch("breed");
                                  return (
                                    <div
                                      key={b}
                                      className={cn(
                                        "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-[14px] hover:bg-gray-100",
                                        isSelected && "bg-[#04838C]/5 font-medium",
                                        !isSelected && currentBreeds.length >= 2 && "pointer-events-none opacity-50"
                                      )}
                                      onClick={() => {
                                        if (isSelected) {
                                          setValue("breed", currentBreeds.filter((item) => item !== b), { shouldValidate: true });
                                        } else if (currentBreeds.length < 2) {
                                          setValue("breed", [...currentBreeds, b], { shouldValidate: true });
                                        }
                                        setBreedSearch("");
                                      }}
                                    >
                                      {b}
                                      {isSelected && <span className="text-[12px] font-bold text-[#04838C]">✓</span>}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <p className="text-[12px] text-[#657386]">Select up to 2 breeds for mixed breeds</p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="h-[46px] rounded-[12px] w-full border border-[#E5E7EB] bg-[#fff] px-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] transition-all duration-300">
                        <SelectValue placeholder="Age" />
                      </SelectTrigger>
                      <SelectContent className="premium-scrollbar max-h-[300px]">
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((yr) => (
                          <SelectItem key={yr} value={yr.toString()}>
                            {yr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Address"
                      className="h-[46px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[16px] sm:text-[16px] text-[14px] shadow-none font-[400] text-[#000] placeholder:text-[#657386] focus:outline-none focus:ring-0 focus:border-0 transition-all duration-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-3 pt-[8px]">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 h-[46px] rounded-[12px] border border-input text-[#14181F] hover:bg-[#F5F5F5] font-medium cursor-pointer"
              >
                <ArrowLeft className="ml-1 w-4 h-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-[46px] rounded-[12px] bg-[#03838C] hover:bg-[#036b73] text-white font-[600] sm:text-[16px] text-[14px] cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-1 w-4 h-4" /></>}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PetDetailsStep;


