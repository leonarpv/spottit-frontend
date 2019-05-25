import { CachedAuthService } from "./CachedAuthService";
import { Cache } from "./Cache";
import { AuthService } from "./AuthService";

describe("CachedAuthService", () => {
  let cache: Cache;
  let baseAuthService: AuthService;
  let cachedAuthService: AuthService;

  beforeEach(() => {
    cache = {
      getItem: jest.fn(),
      removeItem: jest.fn(),
      setItem: jest.fn()
    };
    baseAuthService = {
      getTokens: jest.fn(),
      isLoggedIn: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      subscribe: jest.fn().mockReturnValue(() => {})
    };
    cachedAuthService = new CachedAuthService({
      cache,
      baseAuthService
    });
  });

  it("login: should login the decorated auth service", () => {
    // Given
    const accessToken = "access-token";
    const refreshToken = "refresh-token";

    // When
    cachedAuthService.login(accessToken, refreshToken);

    // Then
    expect(baseAuthService.login).toHaveBeenCalledTimes(1);
    expect(baseAuthService.login).toHaveBeenCalledWith(
      accessToken,
      refreshToken
    );
  });

  it("login: should cache the access token", () => {
    // Given
    const accessToken = "access-token";

    // When
    cachedAuthService.login(accessToken, "");

    // Then
    expect(cache.setItem).toHaveBeenCalledWith("accessToken", accessToken);
  });

  it("login: should cache the refresh token", () => {
    // Given
    const refreshToken = "refresh-token";

    // When
    cachedAuthService.login("", refreshToken);

    // Then
    expect(cache.setItem).toHaveBeenCalledWith("refreshToken", refreshToken);
  });

  it("logout: should un-cache the access token", () => {
    // Given
    const accessToken = "access-token";
    cachedAuthService.login(accessToken, "");

    // When
    cachedAuthService.logout();

    // Then
    expect(cache.removeItem).toHaveBeenCalledWith("accessToken");
  });

  it("logout: should un-cache the refresh token", () => {
    // Given
    const refreshToken = "refresh-token";
    cachedAuthService.login("", refreshToken);

    // When
    cachedAuthService.logout();

    // Then
    expect(cache.removeItem).toHaveBeenCalledWith("refreshToken");
  });

  it("getTokens: should return the result of the decorated service", () => {
    // Given
    const accessToken = "access-token";
    const refreshToken = "refresh-token";
    (baseAuthService.getTokens as jest.Mock).mockReturnValue({
      accessToken,
      refreshToken
    });

    // When
    const result = cachedAuthService.getTokens();

    // Then
    expect(result).toEqual({
      accessToken,
      refreshToken
    });
  });

  it("isLoggedIn: should return the result of the decorated service", () => {
    // Given
    (baseAuthService.isLoggedIn as jest.Mock).mockReturnValue(false);

    // When
    const result = cachedAuthService.isLoggedIn();

    // Then
    expect(result).toBe(false);
  });

  it("subscriber: should subscriber to the decorated service", () => {
    // Given
    const subscriber = jest.fn();

    // When
    const unsubscribe = cachedAuthService.subscribe(subscriber);

    // Then
    expect(baseAuthService.subscribe).toHaveBeenCalledTimes(1);
    expect(baseAuthService.subscribe).toHaveBeenCalledWith(subscriber);
    expect(unsubscribe).toEqual(expect.any(Function));
  });
});
