import Grid from '@mui/material/Grid2';
import dynamic from 'next/dynamic';

// This component will only be rendered on the client.
const Calendar = dynamic(() => import('../component/Calendar'), { ssr: false });

const Page:React.FC = () => {
  return (
    <Grid container spacing={2} >
        <Grid size={12} >
            <Calendar/>
        </Grid>
    </Grid>
  )
}
export default Page;
