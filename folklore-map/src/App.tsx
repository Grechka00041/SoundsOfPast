import {Layout} from './components/Layout';
import {RegionMap} from './components/Map';
import {mockTracks} from "./mocks/tracks.ts";

function App() {
    return (
      <Layout>
        <RegionMap tracks={mockTracks}/>
      </Layout>
  );
}

export default App;