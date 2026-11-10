import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/** Erreur Axios realiste (reponse HTTP avec statut et corps). status undefined = reseau coupe. */
export function axiosError(status?: number, data?: unknown): AxiosError {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = status === undefined ? undefined : ({ status, data, statusText: "", headers: {}, config } as AxiosResponse);
  return new AxiosError("boom", "ERR", config, undefined, response);
}

/** Promesse dont on controle la resolution (pour simuler des reponses qui arrivent dans le desordre). */
export function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
