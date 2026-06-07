import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = "1234567890"; // Mock phone number
  const message = "Hello! I would like to inquire about a reservation.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="whatsapp-float"
      title="Chat with us on WhatsApp"
    >
      <i className="fab fa-whatsapp"></i>
      <span className="whatsapp-tooltip">Chat with us</span>
    </a>
  );
};

export default WhatsAppButton;
