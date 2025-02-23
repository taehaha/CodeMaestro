declare module "my-code/src/utils/tokenstorage" {
    interface TokenStorage {
      setAccessToken: (token: string) => void;
      getAccessToken: () => string | null;
      removeAccessToken: () => void;
    }
  
    const tokenStorage: TokenStorage;
    export default tokenStorage;
  }
  