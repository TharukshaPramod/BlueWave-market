import { useNavigate } from 'react-router-dom';
import Checkout from '../components/Checkout';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const handleCheckoutSuccess = () => {
    navigate('/payments');
  };

  return <Checkout onCheckoutSuccess={handleCheckoutSuccess} />;
};

export default CheckoutPage;