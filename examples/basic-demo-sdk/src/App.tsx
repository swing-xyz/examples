import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { AuthProvider } from './hooks/useAuth';
import getLibrary from './hooks/getLibrary';
import Home from './home';

const NetworkContextName = 'NETWORK';
const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
}

export default App;
