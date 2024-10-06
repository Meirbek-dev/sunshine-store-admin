import { Copy, Server } from "lucide-react";
import { toast } from "react-hot-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ApiAlertProperties {
  title: string;
  description: string;
  variant: "public" | "admin";
}

const textMap: Record<ApiAlertProperties["variant"], string> = {
  public: "Общественный",
  admin: "Административный",
};

const variantMap: Record<ApiAlertProperties["variant"], BadgeProps["variant"]> = {
  public: "secondary",
  admin: "destructive",
};

export const ApiAlert: React.FC<ApiAlertProperties> = ({
  title,
  description,
  variant = "public",
}) => {
  const onCopy = (description: string) => {
    navigator.clipboard.writeText(description);
    toast.success("API-маршрут скопирован в буфер обмена.");
  };

  return (
    <Alert>
      <Server className="size-4" />
      <AlertTitle className="flex size-4 items-center gap-x-2">
        {title}
        <Badge variant={variantMap[variant]}>{textMap[variant]}</Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button variant="outline" size="sm" onClick={() => onCopy(description)}>
          <Copy className="size-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
