import { Spinner } from "@workspace/ui/components/spinner";

export default function SettingsLoading() {
  return (
    <div className="flex w-full items-center justify-center">
      <Spinner className="size-14 text-primary" strokeWidth={1} />
    </div>
  );
}
