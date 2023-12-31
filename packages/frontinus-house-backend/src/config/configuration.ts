import * as process from 'process';

export interface DbConfig {
  port: number;
  host: string;
  username: string;
  password: string;
  database: string;
}

export interface FileConfig {
  basePath: string;
}

export interface Config {
  database: DbConfig;
  env: string;
  JSONRPC: string;
  Web3RpcUrl: string;
  file: FileConfig;
  enableAdmin: boolean;
  enableDebugMode: boolean;
}

const config = (): Config => ({
  database: {
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  env: process.env.NODE_ENV ?? 'development',
  JSONRPC: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  Web3RpcUrl: process.env.WEB3_RPC_URL,
  file: {
    basePath: process.env.FILE_BASE_PATH ?? '/data',
  },
  enableAdmin: process.env.ENABLE_ADMIN === 'true' ?? false,
  enableDebugMode: process.env.DEBUG_MODE === 'true' ?? false,
});

export const subgraphApiUri =
  'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph';

export const envComparitorFactory = (value: RegExp) => () =>
  config().env.match(value) !== null;

export const isDevEnv = envComparitorFactory(/^dev(elopment)?$/);

export const isProdEnv = envComparitorFactory(/^prod(uction)?$/);

export default config;
