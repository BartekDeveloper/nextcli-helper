"use client";
import React, { useEffect, useMemo } from "react"

interface BackendHookOut {
  data:    any|any[]|null,
  loading: boolean,
  error:   string|null
}

type FetchURL = URL|string|globalThis.Request

const useBackend = (
  url:      FetchURL,
  options?: RequestInit
): BackendHookOut => {
  const [data, SetData]       = React.useState<any|any[]|null>(null)
  const [loading, SetLoading] = React.useState<boolean>(true)
  const [error, SetError]     = React.useState<string|null>(null)
  
  useEffect(() => {
    const GetData = async() => {
      SetLoading(true);
      try {
        const res = await fetch(url, options);
        if(!res.ok) {
          throw Error(await res.text() || "Unknown Error");
        }
        SetData(await res.json());
        
      } catch(e) {
        SetError(e);
        
      } finally {
        SetLoading(false);
      }
    }
    GetData();       
  }, []);
  
  
  return { data, loading, error };
}

export {
  useBackend,
  type BackendHookOut,
}