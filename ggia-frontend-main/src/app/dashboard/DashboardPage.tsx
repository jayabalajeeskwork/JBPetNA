"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  PawPrint,
  Search,
  Smartphone,
  Upload,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores/useStore";
import { ACKNOWLEDGEMENT_STATUS_OPTIONS } from "@/utils/constants";
import { formatPhoneNumber } from "@/utils/formatters";

type Channel = "Email" | "SMS";
type RowStatus = "Pending" | "Approved" | "Rejected";

type AckRow = {
  _id: string;
  owner: {
    name: string | null;
    phone: string;
    email?: string;
  };
  pet: {
    name: string | null;
    type: number;
    breed: string[];
    age: number;
    address: string;
  };
  sendLinkVia: string;
  createdAt: string;
  status: number;
};

function ChannelBadge({ channel }: { channel: Channel }) {
  if (channel === "Email") {
    return (
      <Badge
        variant="outline"
        className="gap-1 rounded-full border-[#099AF4] px-[14px] py-[6px] bg-[#099af41a] font-normal text-[#099AF4]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <g clipPath="url(#clip0_623_963)">
            <path
              d="M11.7532 12.1525H2.24561C1.67661 12.1517 1.13114 11.9253 0.728835 11.5229C0.326531 11.1206 0.100244 10.5751 0.0996094 10.0061V3.99366C0.100245 3.4247 0.326544 2.87922 0.72886 2.47691C1.13118 2.07459 1.67665 1.84829 2.24561 1.84766H11.7532C12.3222 1.84829 12.8677 2.07458 13.2701 2.47688C13.6725 2.87919 13.8989 3.42466 13.8996 3.99366V10.0061C13.899 10.5751 13.6726 11.1207 13.2702 11.5231C12.8679 11.9255 12.3223 12.1518 11.7532 12.1525ZM2.24561 2.84766C1.94177 2.84797 1.65046 2.96881 1.43562 3.18366C1.22077 3.39851 1.09993 3.68982 1.09961 3.99366V10.0061C1.09982 10.31 1.22062 10.6014 1.43547 10.8163C1.65033 11.0312 1.9417 11.1521 2.24561 11.1525H11.7532C12.0572 11.1521 12.3486 11.0313 12.5635 10.8163C12.7784 10.6014 12.8993 10.31 12.8996 10.0061V3.99366C12.8992 3.68978 12.7783 3.39847 12.5633 3.18364C12.3484 2.9688 12.0571 2.84797 11.7532 2.84766H2.24561Z"
              fill="#099AF4"
            />
            <path
              d="M6.99433 8.34504C6.57481 8.34917 6.16615 8.21177 5.83433 7.95504L0.48713 3.69384C0.38343 3.61114 0.316828 3.49064 0.301975 3.35884C0.287123 3.22704 0.325236 3.09474 0.40793 2.99104C0.490625 2.88734 0.611127 2.82073 0.742927 2.80588C0.874728 2.79103 1.00703 2.82914 1.11073 2.91184L6.45633 7.17304C6.61424 7.28504 6.80318 7.34497 6.99678 7.34447C7.19038 7.34397 7.379 7.28306 7.53633 7.17024L12.8159 2.91384C12.9191 2.83061 13.0511 2.79178 13.1829 2.80588C13.3147 2.81998 13.4355 2.88587 13.5187 2.98904C13.602 3.09221 13.6408 3.22421 13.6267 3.35601C13.6126 3.48781 13.5467 3.60861 13.4435 3.69184L8.16553 7.94824C7.83142 8.20949 7.41843 8.34941 6.99433 8.34504Z"
              fill="#099AF4"
            />
          </g>
          <defs>
            <clipPath id="clip0_623_963">
              <rect width="14" height="14" fill="white" />
            </clipPath>
          </defs>
        </svg>
        Email
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 rounded-full border-[#A538F9] px-[14px] py-[6px] bg-[#a538f91a] font-normal text-[#A538F9]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M6.99996 0.875004C5.92168 0.873701 4.86221 1.15742 3.92888 1.69743C2.99556 2.23743 2.22155 3.01453 1.68527 3.95C1.14899 4.88546 0.869485 5.94605 0.875082 7.02432C0.88068 8.10259 1.17118 9.16022 1.71714 10.0901L0.897707 12.5493C0.875813 12.615 0.869844 12.685 0.880292 12.7535C0.89074 12.822 0.917307 12.887 0.957804 12.9432C0.998302 12.9994 1.05157 13.0452 1.11323 13.0768C1.17489 13.1084 1.24317 13.125 1.31246 13.125C1.34436 13.1249 1.37618 13.1215 1.40739 13.1149L4.26471 12.4793C5.0913 12.8922 6.00061 13.1128 6.92454 13.1245C7.84848 13.1362 8.76309 12.9387 9.59987 12.5468C10.4367 12.1549 11.1739 11.5788 11.7565 10.8616C12.339 10.1443 12.7518 9.30459 12.9637 8.40522C13.1757 7.50586 13.1815 6.57019 12.9806 5.66829C12.7797 4.76639 12.3773 3.92163 11.8037 3.19727C11.23 2.47292 10.4999 1.88775 9.66797 1.48558C8.83607 1.08341 7.92396 0.874678 6.99996 0.875004ZM6.99996 12.25C6.13869 12.2495 5.29074 12.0374 4.53071 11.6323C4.4673 11.5984 4.39653 11.5806 4.32464 11.5806C4.29274 11.5807 4.26092 11.5841 4.22971 11.5907L1.97221 12.0929L2.61139 10.1745C2.63221 10.113 2.63909 10.0477 2.63152 9.9832C2.62395 9.91873 2.60213 9.85675 2.56764 9.80175C1.94697 8.81727 1.67127 7.65434 1.78396 6.496C1.89664 5.33766 2.39131 4.24967 3.1901 3.40327C3.98889 2.55687 5.04645 2.00012 6.19634 1.82064C7.34622 1.64116 8.52315 1.84914 9.54188 2.41185C10.5606 2.97456 11.3633 3.86005 11.8236 4.92896C12.284 5.99786 12.3758 7.18949 12.0846 8.31629C11.7935 9.4431 11.1359 10.4411 10.2154 11.1532C9.29494 11.8654 8.16377 12.2512 6.99996 12.25Z"
          fill="#A538F9"
        />
        <path
          d="M7.21875 7.65625C7.58119 7.65625 7.875 7.36244 7.875 7C7.875 6.63756 7.58119 6.34375 7.21875 6.34375C6.85631 6.34375 6.5625 6.63756 6.5625 7C6.5625 7.36244 6.85631 7.65625 7.21875 7.65625Z"
          fill="#A538F9"
        />
        <path
          d="M9.40625 7.65625C9.76869 7.65625 10.0625 7.36244 10.0625 7C10.0625 6.63756 9.76869 6.34375 9.40625 6.34375C9.04381 6.34375 8.75 6.63756 8.75 7C8.75 7.36244 9.04381 7.65625 9.40625 7.65625Z"
          fill="#A538F9"
        />
        <path
          d="M5.03125 7.65625C5.39369 7.65625 5.6875 7.36244 5.6875 7C5.6875 6.63756 5.39369 6.34375 5.03125 6.34375C4.66881 6.34375 4.375 6.63756 4.375 7C4.375 7.36244 4.66881 7.65625 5.03125 7.65625Z"
          fill="#A538F9"
        />
      </svg>
      SMS
    </Badge>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  const styles: Record<RowStatus, string> = {
    Pending:
      "border-[#F4CD09] bg-[#f4cd091a] px-[14px] py-[6px] rounded-full text-[#F4CD09] [&_.dot]:bg-[#F4CD09]",
    Approved:
      "border-[#11C468] bg-[#11c4681a] px-[14px] py-[6px] rounded-full text-[#11C468] [&_.dot]:bg-[#11C468]",
    Rejected:
      "border-[#F63737] bg-[#f637371a] px-[14px] py-[6px] rounded-full text-[#F63737] [&_.dot]:bg-[#F63737]",
  };

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full border font-normal", styles[status])}
    >
      <span className="dot size-1.5 shrink-0 rounded-full" />
      {status}
    </Badge>
  );
}

const PAGE_SIZE = 20;

type DateFilter = "all" | "today" | "last7" | "lastMonth" | "last6Months";

export function DashboardPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [date] = React.useState<Date | undefined>();
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [page, setPage] = React.useState(1);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all");
  const [channelFilter, setChannelFilter] = React.useState<
    "all" | "sms" | "email"
  >("all");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [isDateOpen, setIsDateOpen] = React.useState(false);
  const [isChannelOpen, setIsChannelOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const setAcknowledgementSheetOpen = useStore(
    (state) => state.setAcknowledgementSheetOpen,
  );
  const setPetType = useStore((state) => state.setPetType);
  const getAcknowledgments = useStore((state) => state.getAcknowledgments);
  const acknowledgments = useStore((state) => state.acknowledgments);
  const isListLoading = useStore((state) => state.isListLoading);
  const acknowledgmentMeta = useStore((state) => state.acknowledgmentMeta);

  const totalResults = acknowledgmentMeta?.totalItems || 0;
  const totalPages = acknowledgmentMeta?.totalPages || 1;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalResults);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      getAcknowledgments(page, PAGE_SIZE);
    }
  }, [page, getAcknowledgments, isMounted]);

  const columns = React.useMemo(
    () => [
      {
        header: "Owner",
        className:
          "bg-[#0d8c7a0d] px-8 text-[14px] font-[600] tracking-wide text-[#666E7D] first:rounded-tl-xl",
        cell: (row: AckRow) =>
          row.owner?.name ||
          row.owner?.email ||
          formatPhoneNumber(row.owner?.phone, true) ||
          "N/A",
      },
      {
        header: "Pet Name",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) => row.pet?.name || "-",
      },
      {
        header: "Type",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) => (row.pet?.type === 1 ? "Dog" : "Cat"),
      },
      {
        header: "Breed",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) =>
          Array.isArray(row.pet?.breed)
            ? row.pet.breed.join(", ")
            : row.pet?.breed || "N/A",
      },
      {
        header: "Sent To",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) =>
          row.sendLinkVia === "mobile"
            ? formatPhoneNumber(row.owner?.phone, true)
            : row.owner?.email,
      },
      {
        header: "Sent",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) =>
          row.createdAt
            ? format(new Date(row.createdAt), "MMM d, yyyy h:mm a")
            : "N/A",
      },
      {
        header: "Status",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px]",
        cell: (row: AckRow) => {
          const statusOption = ACKNOWLEDGEMENT_STATUS_OPTIONS.find(
            (opt) => opt.value === row.status,
          );
          return (
            <StatusBadge
              status={(statusOption?.label as RowStatus) || "Pending"}
            />
          );
        },
      },
      {
        header: "Action",
        className:
          "bg-[#0d8c7a0d] px-8 py-[1.2rem] text-[14px] font-[600] tracking-wide text-[#666E7D] leading-[20px] last:rounded-tr-xl",
        cell: (row: AckRow) => (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-[12px] border border-[#E5E7EB] p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="View"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12.0003 5.625C10.2045 5.62624 8.44393 6.12342 6.91274 7.06172C5.38154 8.00002 4.13924 9.34299 3.32283 10.9425C3.1562 11.2701 3.06934 11.6325 3.06934 12C3.06934 12.3675 3.1562 12.7299 3.32283 13.0575C4.14103 14.6546 5.38411 15.9949 6.91517 16.9308C8.44623 17.8667 10.2059 18.3619 12.0003 18.3619C13.7948 18.3619 15.5544 17.8667 17.0855 16.9308C18.6166 15.9949 19.8596 14.6546 20.6778 13.0575C20.8445 12.7299 20.9313 12.3675 20.9313 12C20.9313 11.6325 20.8445 11.2701 20.6778 10.9425C19.8614 9.34299 18.6191 8.00002 17.0879 7.06172C15.5567 6.12342 13.7962 5.62624 12.0003 5.625ZM19.3428 12.375C18.6505 13.7264 17.5987 14.8604 16.3032 15.6524C15.0077 16.4443 13.5187 16.8633 12.0003 16.8633C10.4819 16.8633 8.99302 16.4443 7.6975 15.6524C6.40199 14.8604 5.35016 13.7264 4.65783 12.375C4.59201 12.261 4.55735 12.1317 4.55735 12C4.55735 11.8683 4.59201 11.739 4.65783 11.625C5.35016 10.2736 6.40199 9.13955 7.6975 8.34763C8.99302 7.55571 10.4819 7.13667 12.0003 7.13667C13.5187 7.13667 15.0077 7.55571 16.3032 8.34763C17.5987 9.13955 18.6505 10.2736 19.3428 11.625C19.4087 11.739 19.4433 11.8683 19.4433 12C19.4433 12.1317 19.4087 12.261 19.3428 12.375Z"
                    fill="#14181F"
                    fillOpacity="0.8"
                  />
                  <path
                    d="M12 8.625C11.3325 8.625 10.68 8.82294 10.125 9.19379C9.56994 9.56464 9.13735 10.0917 8.88191 10.7084C8.62646 11.3251 8.55963 12.0037 8.68985 12.6584C8.82008 13.3131 9.14151 13.9145 9.61352 14.3865C10.0855 14.8585 10.6869 15.1799 11.3416 15.3102C11.9963 15.4404 12.6749 15.3735 13.2916 15.1181C13.9083 14.8626 14.4354 14.4301 14.8062 13.8751C15.1771 13.32 15.375 12.6675 15.375 12C15.373 11.1055 15.0168 10.2482 14.3843 9.6157C13.7518 8.9832 12.8945 8.62698 12 8.625ZM12 13.875C11.6292 13.875 11.2666 13.765 10.9583 13.559C10.65 13.353 10.4096 13.0601 10.2677 12.7175C10.1258 12.3749 10.0887 11.9979 10.161 11.6342C10.2334 11.2705 10.412 10.9364 10.6742 10.6742C10.9364 10.412 11.2705 10.2334 11.6342 10.161C11.9979 10.0887 12.3749 10.1258 12.7175 10.2677C13.0601 10.4096 13.353 10.65 13.559 10.9583C13.765 11.2666 13.875 11.6292 13.875 12C13.875 12.4973 13.6775 12.9742 13.3258 13.3258C12.9742 13.6775 12.4973 13.875 12 13.875Z"
                    fill="#14181F"
                    fillOpacity="0.8"
                  />
                </svg>
              </Button>
            </div>
            <div className="inline-flex items-center gap-1 rounded-[12px] border border-[#E5E7EB] p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label="Send"
                onClick={() => {
                  setPetType(row.pet?.type === 2 ? "Cat" : "Dog");
                  setAcknowledgementSheetOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21.2471 9.98269L5.60958 2.31019C5.21857 2.11735 4.77994 2.04226 4.34705 2.09407C3.91415 2.14587 3.50563 2.32233 3.17115 2.60198C2.83667 2.88164 2.59065 3.25245 2.46299 3.66933C2.33534 4.08621 2.33155 4.5312 2.45208 4.95019L4.49958 12.0002L2.45208 19.0502C2.35568 19.385 2.33836 19.7377 2.40151 20.0804C2.46465 20.4231 2.60653 20.7464 2.81595 21.0249C3.02537 21.3034 3.29662 21.5295 3.60832 21.6853C3.92001 21.8411 4.26363 21.9224 4.61208 21.9227C4.95804 21.9229 5.29938 21.8433 5.60958 21.6902L21.2471 14.0177C21.6235 13.8319 21.9404 13.5444 22.162 13.1879C22.3836 12.8314 22.501 12.42 22.501 12.0002C22.501 11.5804 22.3836 11.169 22.162 10.8125C21.9404 10.456 21.6235 10.1685 21.2471 9.98269ZM20.5796 12.6752L4.94958 20.3402C4.82286 20.3994 4.68212 20.4219 4.54325 20.4053C4.40438 20.3888 4.27291 20.3337 4.1637 20.2463C4.05449 20.1589 3.97188 20.0428 3.92521 19.9109C3.87854 19.7791 3.86966 19.6368 3.89958 19.5002L5.81208 12.7502H11.9996C12.1985 12.7502 12.3893 12.6712 12.5299 12.5305C12.6706 12.3899 12.7496 12.1991 12.7496 12.0002C12.7496 11.8013 12.6706 11.6105 12.5299 11.4699C12.3893 11.3292 12.1985 11.2502 11.9996 11.2502H5.81208L3.89958 4.53769C3.86613 4.40271 3.87085 4.2611 3.91323 4.12866C3.95562 3.99621 4.03398 3.87816 4.13958 3.78769C4.27348 3.67317 4.44341 3.60945 4.61958 3.60769C4.73445 3.60955 4.84735 3.63778 4.94958 3.69019L20.5796 11.3252C20.7064 11.3866 20.8133 11.4825 20.8882 11.6019C20.963 11.7213 21.0027 11.8593 21.0027 12.0002C21.0027 12.1411 20.963 12.2791 20.8882 12.3985C20.8133 12.5179 20.7064 12.6138 20.5796 12.6752Z"
                    fill="#14181F"
                    fillOpacity="0.8"
                  />
                </svg>
              </Button>
            </div>
          </div>
        ),
      },
    ],
    [setAcknowledgementSheetOpen, setPetType],
  );

  if (!isMounted) return null;

  return (
    <main className="mx-auto flex w-full max-w-[100%] flex-1 flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[200px] flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for Owner/Pet"
              className="h-[52px] rounded-[12px] border border-[#E5E7EB] bg-[#fff] px-[20px] pl-[35px] text-[16px] font-[400] leading-[20px] text-[#657386] placeholder:text-[#657386]"
            />
          </div>
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-[52px] w-full relative justify-start gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-left font-normal sm:w-[180px] text-[#14181fb3] text-[16px] font-[400] leading-[20px] hover:bg-[#F3F4F6] hover:text-[#14181F] cursor-pointer",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M15 3.75H14.375V3.125C14.375 2.78125 14.0938 2.5 13.75 2.5C13.4062 2.5 13.125 2.78125 13.125 3.125V3.75H7.5V3.125C7.5 2.78125 7.21875 2.5 6.875 2.5C6.53125 2.5 6.25 2.78125 6.25 3.125V3.75H5.625C3.9 3.75 2.5 5.15 2.5 6.875V14.375C2.5 16.1 3.9 17.5 5.625 17.5H15C16.725 17.5 18.125 16.1 18.125 14.375V6.875C18.125 5.15 16.725 3.75 15 3.75ZM16.875 14.375C16.875 15.4062 16.0312 16.25 15 16.25H5.625C4.59375 16.25 3.75 15.4062 3.75 14.375V6.875C3.75 5.84375 4.59375 5 5.625 5H6.25V5.63125C6.25 5.975 6.53125 6.25625 6.875 6.25625C7.21875 6.25625 7.5 5.975 7.5 5.63125V5H13.125V5.63125C13.125 5.975 13.4062 6.25625 13.75 6.25625C14.0938 6.25625 14.375 5.975 14.375 5.63125V5H15C16.0312 5 16.875 5.84375 16.875 6.875V14.375Z"
                    fill="#14181F"
                    fillOpacity="0.7"
                  />
                  <path
                    d="M14.3313 7.5H6.25C5.90625 7.5 5.625 7.78125 5.625 8.125C5.625 8.46875 5.90625 8.75 6.25 8.75H14.3313C14.675 8.75 14.9563 8.46875 14.9563 8.125C14.9563 7.78125 14.675 7.5 14.3313 7.5Z"
                    fill="#14181F"
                    fillOpacity="0.7"
                  />
                </svg>
                {date ? format(date, "MMM d, yyyy") : "All"}
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="#14181F"
                      strokeOpacity="0.7"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[260px] p-4" align="start">
              <div className="flex flex-col gap-4">
                <RadioGroup
                  className="flex flex-col gap-[20px] text-[14px] text-[#14181F]"
                  value={dateFilter}
                  onValueChange={(val) => {
                    setDateFilter(val as DateFilter);
                    setIsDateOpen(false);
                  }}
                >
                  <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value="all" />
                    <span className="text-[16px] font-[500] leading-[20px] text-[#14181F]">
                      All
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value="today" />
                    <span className="text-[16px] font-[500] leading-[20px] text-[#14181F]">
                      Today
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value="last7" />
                    <span className="text-[16px] font-[500] leading-[20px] text-[#14181F]">
                      Last 7 Days
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value="lastMonth" />
                    <span className="text-[16px] font-[500] leading-[20px] text-[#14181F]">
                      Last Month
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value="last6Months" />
                    <span className="text-[16px] font-[500] leading-[20px] text-[#14181F]">
                      Last 6 months
                    </span>
                  </label>
                </RadioGroup>

                <div className="h-px bg-[#E5E7EB]" />

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex h-[48px] flex-1 items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-left"
                          >
                            <CalendarIcon className="h-4 w-4 text-[#6B7280]" />
                            <span className="text-[13px] leading-[18px] text-[#14181F]">
                              {startDate
                                ? format(startDate, "MMM d, yyyy")
                                : "Select date"}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-px flex-1 bg-[#E5E7EB]" />
                      <span className="text-[10px] font-[500] uppercase tracking-[0.16em] text-[#9CA3AF]">
                        to
                      </span>
                      <span className="h-px flex-1 bg-[#E5E7EB]" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex h-[48px] flex-1 items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-left"
                          >
                            <CalendarIcon className="h-4 w-4 text-[#6B7280]" />
                            <span className="text-[13px] leading-[18px] text-[#14181F]">
                              {endDate
                                ? format(endDate, "MMM d, yyyy")
                                : "Select date"}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Popover open={isChannelOpen} onOpenChange={setIsChannelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-[52px] w-full flex items-center justify-between gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-left font-normal sm:w-[220px] text-[#14181fb3] text-[16px] font-[400] leading-[20px] hover:bg-[#F3F4F6] hover:text-[#14181F] cursor-pointer",
                )}
              >
                <span className="text-[14px] font-[500] leading-[20px] text-[#14181f66]">
                  Sent To :
                </span>

                {channelFilter === "all" ? (
                  <span className=""></span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#099AF4] bg-[#EEF2FF] px-[14px] py-[6px] text-[14px] font-[500] leading-[20px] text-[#099AF4]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M11.7532 12.1525H2.24561C1.67661 12.1517 1.13114 11.9253 0.728835 11.5229C0.326531 11.1206 0.100244 10.5751 0.0996094 10.0061V3.99366C0.100245 3.4247 0.326544 2.87922 0.72886 2.47691C1.13118 2.07459 1.67665 1.84829 2.24561 1.84766H11.7532C12.3222 1.84829 12.8677 2.07458 13.2701 2.47688C13.6725 2.87919 13.8989 3.42466 13.8996 3.99366V10.0061C13.899 10.5751 13.6726 11.1207 13.2702 11.5231C12.8679 11.9255 12.3223 12.1518 11.7532 12.1525ZM2.24561 2.84766C1.94177 2.84797 1.65046 2.96881 1.43562 3.18366C1.22077 3.39851 1.09993 3.68982 1.09961 3.99366V10.0061C1.09982 10.31 1.22062 10.6014 1.43547 10.8163C1.65033 11.0312 1.9417 11.1521 2.24561 11.1525H11.7532C12.0572 11.1521 12.3486 11.0313 12.5635 10.8163C12.7784 10.6014 12.8993 10.31 12.8996 10.0061V3.99366C12.8992 3.68978 12.7783 3.39847 12.5633 3.18364C12.3484 2.9688 12.0571 2.84797 11.7532 2.84766H2.24561Z"
                        fill="#099AF4"
                      />
                      <path
                        d="M6.99433 8.34504C6.57481 8.34917 6.16615 8.21177 5.83433 7.95504L0.48713 3.69384C0.38343 3.61114 0.316828 3.49064 0.301975 3.35884C0.287123 3.22704 0.325236 3.09474 0.40793 2.99104C0.490625 2.88734 0.611127 2.82073 0.742927 2.80588C0.874728 2.79103 1.00703 2.82914 1.11073 2.91184L6.45633 7.17304C6.61424 7.28504 6.80318 7.34497 6.99678 7.34447C7.19038 7.34397 7.379 7.28306 7.53633 7.17024L12.8159 2.91384C12.9191 2.83061 13.0511 2.79178 13.1829 2.80588C13.3147 2.81998 13.4355 2.88587 13.5187 2.98904C13.602 3.09221 13.6408 3.22421 13.6267 3.35601C13.6126 3.48781 13.5467 3.60861 13.4435 3.69184L8.16553 7.94824C7.83142 8.20949 7.41843 8.34941 6.99433 8.34504Z"
                        fill="#099AF4"
                      />
                    </svg>
                    {channelFilter === "sms" ? "All SMS" : "All Email"}{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChannelFilter("all");
                        setIsChannelOpen(false);
                      }}
                      className="text-[16px] leading-none cursor-pointer hover:text-red-500 transition-colors"
                    >
                      ×
                    </span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[180px] rounded-[12px] border border-[#E5E7EB] bg-white p-4"
              align="start"
            >
              <RadioGroup
                value={channelFilter}
                onValueChange={(val) => {
                  setChannelFilter(val as "all" | "sms" | "email");
                  setIsChannelOpen(false);
                }}
                className="flex flex-col gap-[16px]"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="all" />
                  <span className="text-[14px] font-[500] leading-[20px] text-[#14181F]">
                    All
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="sms" />
                  <span className="text-[14px] font-[500] leading-[20px] text-[#14181F]">
                    All SMS
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="email" />
                  <span className="text-[14px] font-[500] leading-[20px] text-[#14181F]">
                    All Email
                  </span>
                </label>
              </RadioGroup>
            </PopoverContent>
          </Popover>
          <Popover open={isStatusOpen} onOpenChange={setIsStatusOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-[52px] w-full flex items-center justify-between gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#fff] text-left font-normal sm:w-[220px] text-[#14181fb3] text-[16px] font-[400] leading-[20px] hover:bg-[#F3F4F6] hover:text-[#14181F] cursor-pointer",
                )}
              >
                <span className="text-[14px] font-[500] leading-[20px] text-[#14181f66]">
                  Status :
                </span>

                {statusFilter === "all" ? (
                  <span className=""></span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff7d9] px-[14px] py-[6px] text-[14px] font-[500] leading-[20px] text-[#F4CD09]">
                    <span className="h-2 w-2 rounded-full bg-[#F4CD09]" />
                    {statusFilter === "pending"
                      ? "Pending"
                      : statusFilter === "approved"
                        ? "Approved"
                        : "Rejected"}{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter("all");
                        setIsStatusOpen(false);
                      }}
                      className="text-[16px] leading-none cursor-pointer hover:text-red-500 transition-colors"
                    >
                      ×
                    </span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[180px] rounded-[12px] border border-[#E5E7EB] bg-white p-4"
              align="start"
            >
              <RadioGroup
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(
                    val as "all" | "pending" | "approved" | "rejected",
                  );
                  setIsStatusOpen(false);
                }}
                className="flex flex-col gap-[16px]"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="pending" />
                  <StatusBadge status="Pending" />
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="approved" />
                  <StatusBadge status="Approved" />
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="rejected" />
                  <StatusBadge status="Rejected" />
                </label>
              </RadioGroup>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button
            className="h-[48px] gap-2 rounded-[9px] bg-[#03838C] text-white !px-[24px]  hover:bg-teal-700 text-[14px] font-[600] leading-[20px]"
            variant="default"
          >
            <Upload className="size-4" />
            State Report
          </Button>
          <Button
            className="h-[48px] gap-2 rounded-[9px] bg-[#03838C] text-white !px-[24px]  hover:bg-teal-700 text-[14px] font-[600] leading-[20px]"
            variant="default"
          >
            <Upload className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto rounded-xl border border-border/40 bg-background h-[calc(100vh-16.5rem)] premium-scrollbar">
        <Table containerClassName="h-full">
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow className="border-b-0 hover:bg-transparent [&_th]:h-11">
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isListLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                    <span>Loading acknowledgments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : acknowledgments.length === 0 ? (
              <TableRow className="h-[300px]">
                <TableCell colSpan={columns.length} className="text-center">
                  No acknowledgments found.
                </TableCell>
              </TableRow>
            ) : (
              acknowledgments.map((row, rowIndex) => (
                <TableRow
                  key={row._id || rowIndex}
                  className="hover:bg-muted/30 text-[#14181F] !h-[3rem] text-[16px] font-[400] leading-[20px]"
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className="px-8 py-[1.2rem]">
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-[600] text-[#14181F]">
            {start}-{end}
          </span>{" "}
          of <span className="font-[600] text-[#14181F]">{totalResults}</span>{" "}
          results
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-lg cursor-pointer"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => {
              // Show first page, last page, and pages around current page
              if (totalPages <= 5) return true;
              return n === 1 || n === totalPages || Math.abs(n - page) <= 1;
            })
            .map((n, index, array) => (
              <React.Fragment key={n}>
                {index > 0 && array[index - 1] !== n - 1 && (
                  <span className="px-1 text-sm text-muted-foreground">
                    ...
                  </span>
                )}
                <Button
                  variant={page === n ? "default" : "outline"}
                  size="icon-sm"
                  className={cn(
                    "size-8 min-w-8 rounded-lg cursor-pointer",
                    page === n &&
                      "bg-teal-600 text-white hover:bg-teal-700 hover:text-white",
                  )}
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              </React.Fragment>
            ))}

          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-lg cursor-pointer"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
