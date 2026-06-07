import { useState } from 'react';
import HeroSection from '../../components/public/HeroSection';
import ContentCard from '../../components/public/ContentCard';
import SplitDetailSection from '../../components/public/SplitDetailSection';
import CtaBanner from '../../components/public/CtaBanner';
import MenuModal from '../../components/public/MenuModal';

const Dining = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const menus = {
    etoile: {
      category: "Fine Dining",
      title: "L'Étoile",
      sections: [
        {
          name: "Starters",
          items: [
            { name: "Escargots de Bourgogne", price: "$28", description: "Burgundy snails, garlic herb butter, toasted brioche" },
            { name: "Foie Gras Poêlé", price: "$34", description: "Seared foie gras, fig compote, aged balsamic" },
            { name: "Onion Soup Gratinée", price: "$22", description: "Classic French onion soup, cave-aged gruyère" },
            { name: "Beef Carpaccio", price: "$26", description: "Truffle oil, arugula, parmesan shavings, capers" },
            { name: "Scallops Saint-Jacques", price: "$30", description: "Pan-seared scallops, cauliflower purée, caviar" },
            { name: "Heirloom Tomato Tart", price: "$24", description: "Goat cheese mousse, balsamic glaze, fresh basil" }
          ]
        },
        {
          name: "Main Courses",
          items: [
            { name: "Canard à l'Orange", price: "$48", description: "Roasted duck breast, citrus glaze, parsnip purée" },
            { name: "Sole Meunière", price: "$52", description: "Dover sole, brown butter, lemon, capers" },
            { name: "Beef Wellington", price: "$58", description: "Prime fillet, mushroom duxelles, puff pastry" },
            { name: "Rack of Lamb", price: "$54", description: "Herb-crusted lamb, ratatouille, rosemary jus" },
            { name: "Lobster Thermidor", price: "$62", description: "Atlantic lobster, cognac cream, gruyère crust" },
            { name: "Truffle Risotto", price: "$44", description: "Arborio rice, seasonal black truffles, aged parmesan" }
          ]
        },
        {
          name: "Desserts",
          items: [
            { name: "Crème Brûlée", price: "$18", description: "Tahitian vanilla bean, caramelized sugar" },
            { name: "Soufflé au Chocolat", price: "$22", description: "70% Dark chocolate, Grand Marnier cream" },
            { name: "Tarte Tatin", price: "$20", description: "Caramelized apple tart, vanilla bean gelato" },
            { name: "Profiteroles", price: "$19", description: "Choux pastry, vanilla ice cream, warm chocolate sauce" },
            { name: "Selection of French Cheeses", price: "$26", description: "Assorted artisanal cheeses, honey, walnuts" }
          ]
        }
      ]
    },
    prime: {
      category: "Steakhouse",
      title: "The Prime Cut",
      sections: [
        {
          name: "From the Sea",
          items: [
            { name: "Oysters Rockefeller", price: "$32", description: "Half dozen, spinach, pernod, hollandaise" },
            { name: "Jumbo Shrimp Cocktail", price: "$28", description: "Atomic horseradish, house-made cocktail sauce" },
            { name: "Lobster Bisque", price: "$24", description: "Sherry cream, lobster chunks, chive oil" },
            { name: "Seafood Tower", price: "$110", description: "Oysters, shrimp, crab legs, lobster tail, mussels" },
            { name: "Tuna Tartare", price: "$26", description: "Avocado, soy-ginger dressing, wonton crisps" }
          ]
        },
        {
          name: "The Grill",
          items: [
            { name: "A5 Japanese Wagyu", price: "$120", description: "4oz Kagoshima Prefecture, sea salt, wasabi root" },
            { name: "Dry-Aged Ribeye", price: "$65", description: "16oz USDA Prime, 35 days aged, roasted garlic" },
            { name: "Porterhouse for Two", price: "$145", description: "32oz Prime cut, carved table-side" },
            { name: "Filet Mignon", price: "$58", description: "8oz Center cut, béarnaise sauce, asparagus" },
            { name: "New York Strip", price: "$62", description: "14oz Prime cut, peppercorn crust, brandy cream" },
            { name: "Tomahawk Ribeye", price: "$130", description: "40oz Long-bone, truffle butter, sea salt" }
          ]
        },
        {
          name: "Sides",
          items: [
            { name: "Truffle Mac & Cheese", price: "$18", description: "Black truffle, cave-aged gruyère" },
            { name: "Asparagus Hollandaise", price: "$14", description: "Grilled jumbo asparagus, classic hollandaise" },
            { name: "Creamed Spinach", price: "$12", description: "Nutmeg, garlic, toasted breadcrumbs" },
            { name: "Loaded Baked Potato", price: "$13", description: "Bacon, chives, sour cream, aged cheddar" },
            { name: "Lobster Mashed Potatoes", price: "$22", description: "Butter-poached lobster, garlic, cream" }
          ]
        }
      ]
    },
    azure: {
      category: "Lounge & Tapas",
      title: "Azure Lounge",
      sections: [
        {
          name: "Small Plates",
          items: [
            { name: "Ibérico Ham", price: "$26", description: "Acorn-fed, 36 months cured, tomato bread" },
            { name: "Crispy Calamari", price: "$22", description: "Lemon aioli, smoked paprika" },
            { name: "Patatas Bravas", price: "$14", description: "Spicy tomato sauce, garlic aioli" },
            { name: "Gambas al Ajillo", price: "$24", description: "Garlic shrimp, chili flakes, olive oil" },
            { name: "Wagyu Sliders", price: "$28", description: "Caramelized onions, truffle mayo, brioche" },
            { name: "Burrata & Prosciutto", price: "$25", description: "Creamy burrata, parma ham, balsamic pearls" }
          ]
        },
        {
          name: "Signature Cocktails",
          items: [
            { name: "The Gold Standard", price: "$24", description: "Gold-infused gin, saffron syrup, champagne" },
            { name: "Midnight in Paris", price: "$22", description: "Cognac, blackberry liqueur, fresh sage" },
            { name: "Azure Martini", price: "$20", description: "Grey Goose, dry vermouth, blue cheese olives" },
            { name: "Spiced Old Fashioned", price: "$22", description: "Bulleit Bourbon, cinnamon-clove syrup, orange" },
            { name: "Royal Mojito", price: "$24", description: "Aged rum, fresh mint, lime, Veuve Clicquot" },
            { name: "Smoked Mezcalita", price: "$22", description: "Mezcal, agave, lime, hibiscus-salt rim" }
          ]
        },
        {
          name: "Wines by the Glass",
          items: [
            { name: "Dom Pérignon", price: "$65", description: "Vintage Champagne, Epernay, France" },
            { name: "Cloudy Bay", price: "$24", description: "Sauvignon Blanc, Marlborough, NZ" },
            { name: "Caymus", price: "$35", description: "Cabernet Sauvignon, Napa Valley, USA" },
            { name: "Whispering Angel", price: "$20", description: "Rosé, Provence, France" }
          ]
        }
      ]
    }
  };

  const openMenu = (menuKey) => {
    setActiveMenu(menus[menuKey] || menus.etoile);
    setIsMenuOpen(true);
  };

  return (
    <div className="page-wrapper">
      <HeroSection 
        title="Culinary Excellence" 
        tagline="Embark on a gastronomic journey curated by world-renowned chefs."
        backgroundImage="https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
        videoUrl="https://player.vimeo.com/external/363836335.hd.mp4?s=7b9a22f9645281699990e72f8832a768d877e68e&profile_id=175"
      />

      <section className="page-section container">
        <div className="section-header">
          <h2 className="section-title">Our Restaurants</h2>
          <p className="section-subtitle">From intimate fine dining to vibrant brasseries, discover flavors that inspire.</p>
        </div>

        <div className="staggered-grid">
          <div className="stagger-item">
            <div onClick={() => openMenu('etoile')}>
              <ContentCard 
                image="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80"
                title="L'Étoile"
                subtitle="French Fine Dining"
                features={['Chef Jean Dupont', 'Dinner: 6PM - 10PM', 'Dress Code: Formal']}
                linkTo="#"
                linkText="View Menu"
              />
            </div>
          </div>
          <div className="stagger-item mt-12">
            <div onClick={() => openMenu('prime')}>
              <ContentCard 
                image="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                title="The Prime Cut"
                subtitle="Steakhouse"
                features={['Dry-Aged Specialties', 'Dinner: 5PM - 11PM', 'Smart Casual']}
                linkTo="#"
                linkText="View Menu"
              />
            </div>
          </div>
          <div className="stagger-item">
            <div onClick={() => openMenu('azure')}>
              <ContentCard 
                image="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
                title="Azure Lounge"
                subtitle="Cocktails & Tapas"
                features={['Mixologist Curated', 'Open 4PM - 1AM', 'Live Jazz Weekends']}
                linkTo="#"
                linkText="View Menu"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="interactive-menu-section container">
        <div className="menu-grid">
          <div className="menu-text-area">
            <span className="menu-pretitle">Seasonal Selection</span>
            <h2 className="menu-title">Chef's Signature <br />Tasting Menu</h2>
            
            <div className="menu-list">
              <div className="menu-item-hoverable">
                <span className="item-number">01</span>
                <div className="item-info">
                  <h4>Wild Atlantic Lobster</h4>
                  <p>With butter-poached leeks and truffle foam</p>
                </div>
              </div>
              <div className="menu-item-hoverable">
                <span className="item-number">02</span>
                <div className="item-info">
                  <h4>Dry-Aged Wagyu Beef</h4>
                  <p>Mishima Reserve, parsnip silk, bordelaise sauce</p>
                </div>
              </div>
              <div className="menu-item-hoverable">
                <span className="item-number">03</span>
                <div className="item-info">
                  <h4>Yuzu Meringue Tart</h4>
                  <p>Shiso sorbet and ginger-infused honey</p>
                </div>
              </div>
            </div>
            
            <button className="btn btn-outline btn-lg mt-8" onClick={() => openMenu('etoile')}>View Full Menu</button>
          </div>
          <div className="menu-image-area">
            <div className="floating-image-container">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" alt="Dish Preview" className="floating-menu-img" />
              <div className="img-decoration"></div>
            </div>
          </div>
        </div>
      </section>

      <SplitDetailSection 
        image="https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?auto=format&fit=crop&w=1200&q=80"
        title="Michelin-Starred Experiences"
        subtitle="Unforgettable Flavors"
        description="Our commitment to culinary perfection is reflected in our multiple Michelin-starred establishments. We source only the finest seasonal ingredients to create dishes that are as visually stunning as they are delicious."
      />

      <CtaBanner 
        title="Savor the moment."
        subtitle="Reserve your table today for an unforgettable dining experience."
        buttonText="Make a Reservation"
        buttonLink="#reserve"
      />

      {activeMenu && (
        <MenuModal 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          menuData={activeMenu} 
        />
      )}
    </div>
  );
};

export default Dining;
