"use client";

import { useParams } from "next/navigation";

import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface ApiListProperties {
  entityName: string;
  entityIdName: string;
}

export const ApiList: React.FC<ApiListProperties> = ({ entityName, entityIdName }) => {
  const parameters = useParams();
  const origin = useOrigin();

  const baseUrl = `${origin}/api/${parameters.storeId}`;

  return (
    <>
      <ApiAlert title="GET" variant="public" description={`${baseUrl}/${entityName}`} />
      <ApiAlert
        title="GET"
        variant="public"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert title="POST" variant="admin" description={`${baseUrl}/${entityName}`} />
      <ApiAlert
        title="PATCH"
        variant="admin"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert
        title="DELETE"
        variant="admin"
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
    </>
  );
};
