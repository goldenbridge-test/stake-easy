import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../src/hooks/useAuth";
import api from "../src/services/api";
import { axiosError } from "./helpers";

vi.mock("../src/services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const mocked = vi.mocked(api);
const profile = { id: 1, username: "boss", email: "b@x.io" };

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

describe("useAuth.isStaff", () => {
  it("sans token : aucun appel, non staff", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mocked.get).not.toHaveBeenCalled();
    expect(result.current.isStaff).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("token valide + is_staff : isStaff vrai, `user` inchange (reponse de /profile/)", async () => {
    localStorage.setItem("access_token", "t");
    mocked.get.mockImplementation(async (url) => ({ data: url === "/accounts/me/" ? { is_staff: true } : profile }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isStaff).toBe(true);
    expect(result.current.user).toEqual(profile);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("`loading` ne passe a faux qu'apres la reponse de /me/ (pas de flash 'Access Denied')", async () => {
    localStorage.setItem("access_token", "t");
    let release!: (v: unknown) => void;
    mocked.get.mockImplementation((url) =>
      url === "/accounts/me/" ? new Promise((r) => (release = r)) : Promise.resolve({ data: profile }),
    );
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(mocked.get).toHaveBeenCalledWith("/accounts/me/"));
    expect(result.current.loading).toBe(true);
    release({ data: { is_staff: true } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isStaff).toBe(true);
  });

  it("utilisateur non staff", async () => {
    localStorage.setItem("access_token", "t");
    mocked.get.mockImplementation(async (url) => ({ data: url === "/accounts/me/" ? { is_staff: false } : profile }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isStaff).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("is_staff non booleen strict (\"true\", 1) : refuse", async () => {
    localStorage.setItem("access_token", "t");
    mocked.get.mockImplementation(async (url) => ({ data: url === "/accounts/me/" ? { is_staff: "true" } : profile }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isStaff).toBe(false);
  });

  it("/me/ en echec (404 : backend pas a jour) : PAS de deconnexion", async () => {
    localStorage.setItem("access_token", "t");
    localStorage.setItem("refresh_token", "r");
    mocked.get.mockImplementation(async (url) => {
      if (url === "/accounts/me/") throw axiosError(404, {});
      return { data: profile };
    });
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isStaff).toBe(false);
    expect(result.current.user).toEqual(profile);
    expect(localStorage.getItem("access_token")).toBe("t");
    expect(localStorage.getItem("refresh_token")).toBe("r");
  });

  it("/profile/ en echec : comportement d'origine conserve (deconnexion + nettoyage)", async () => {
    localStorage.setItem("access_token", "t");
    localStorage.setItem("refresh_token", "r");
    mocked.get.mockRejectedValue(axiosError(401, {}));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isStaff).toBe(false);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  it("logout remet isStaff a faux", async () => {
    localStorage.setItem("access_token", "t");
    mocked.get.mockImplementation(async (url) => ({ data: url === "/accounts/me/" ? { is_staff: true } : profile }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isStaff).toBe(true));
    act(() => result.current.logout());
    expect(result.current.isStaff).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("login : stocke les tokens puis recharge les droits", async () => {
    mocked.post.mockResolvedValue({ data: { access: "A", refresh: "R" } });
    mocked.get.mockImplementation(async (url) => ({ data: url === "/accounts/me/" ? { is_staff: true } : profile }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.login("boss", "pw");
    });
    expect(mocked.post).toHaveBeenCalledWith("/accounts/login/", { username: "boss", password: "pw" });
    expect(localStorage.getItem("access_token")).toBe("A");
    expect(result.current.isStaff).toBe(true);
  });
});
