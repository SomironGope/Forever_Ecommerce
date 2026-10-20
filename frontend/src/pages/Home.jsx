import BestSeller from '../component/BestSeller';
import Hero from '../component/Hero'
import LatestCollection from '../component/LatestCollection';
import NewLetterBox from '../component/NewLetterBox';
import OurPolicy from '../component/OurPolicy';



function Home() {
  return (
    <div>
       <Hero />
       <LatestCollection />
       <BestSeller/>
       <OurPolicy />
       <NewLetterBox />
    </div>
  )
}

export default Home;