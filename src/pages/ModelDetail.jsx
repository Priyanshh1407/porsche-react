import { useParams } from 'react-router-dom';

export default function ModelDetail() {
  const { carId } = useParams();

  return <h1>Details for {carId}</h1>;
}
