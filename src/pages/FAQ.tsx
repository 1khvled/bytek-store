import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Truck, RotateCcw, Package, CreditCard, HelpCircle } from 'lucide-react';

const faqCategories = [
  {
    id: 'shipping',
    title: 'Livraison',
    icon: Truck,
    questions: [
      {
        q: 'Comment fonctionne la livraison ?',
        a: 'Nous livrons via WorldExpress à travers les 69 wilayas d\'Algérie. La livraison prend généralement 24 à 48 heures maximum après confirmation de votre commande.'
      },
      {
        q: 'Quels sont les frais de livraison ?',
        a: 'Les frais de livraison varient selon votre wilaya et le type de livraison choisi (Stop Desk ou livraison à domicile). Les tarifs exacts sont affichés lors du checkout.'
      },
      {
        q: 'Puis-je suivre ma commande ?',
        a: 'Oui, après expédition de votre commande, vous recevrez un numéro de suivi par téléphone pour suivre votre colis en temps réel.'
      },
      {
        q: 'Livrez-vous dans toute l\'Algérie ?',
        a: 'Oui ! Nous livrons dans les 69 wilayas d\'Algérie via notre partenaire WorldExpress.'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Paiement',
    icon: CreditCard,
    questions: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Nous acceptons uniquement le paiement à la livraison (COD - Cash on Delivery). Vous payez en espèces au livreur lors de la réception de votre colis.'
      },
      {
        q: 'Dois-je payer à l\'avance ?',
        a: 'Non, aucun paiement à l\'avance n\'est requis. Vous payez uniquement à la réception de votre commande.'
      },
      {
        q: 'Puis-je payer par carte bancaire ?',
        a: 'Pour le moment, nous n\'acceptons que le paiement en espèces à la livraison (COD).'
      }
    ]
  },
  {
    id: 'returns',
    title: 'Retours & Remboursements',
    icon: RotateCcw,
    questions: [
      {
        q: 'Puis-je retourner un produit ?',
        a: 'Oui, vous pouvez retourner un produit dans les 3 jours suivant la réception s\'il est défectueux. Le produit doit être dans son emballage d\'origine.'
      },
      {
        q: 'Comment demander un retour ?',
        a: 'Contactez-nous via WhatsApp au 0672 536 920 avec votre numéro de commande et une photo du produit défectueux. Notre équipe vous guidera dans le processus.'
      },
      {
        q: 'Combien de temps prend le remboursement ?',
        a: 'Une fois le produit retourné et vérifié, le remboursement est effectué sous 3 à 5 jours ouvrables.'
      }
    ]
  },
  {
    id: 'products',
    title: 'Produits',
    icon: Package,
    questions: [
      {
        q: 'Vos produits sont-ils authentiques ?',
        a: 'Oui, tous nos produits sont 100% authentiques et originaux. Nous travaillons directement avec les distributeurs officiels.'
      },
      {
        q: 'Offrez-vous une garantie ?',
        a: 'Oui, tous nos produits bénéficient d\'une garantie constructeur. La durée varie selon le produit (généralement 1 à 2 ans).'
      },
      {
        q: 'Puis-je obtenir des conseils avant d\'acheter ?',
        a: 'Absolument ! N\'hésitez pas à nous contacter via WhatsApp au 0672 536 920. Nous serons ravis de vous conseiller selon vos besoins.'
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-foreground text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Centre d'aide</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Questions Fréquentes
            </h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto">
              Trouvez rapidement les réponses à vos questions sur la livraison, le paiement, les retours et nos produits.
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="space-y-8">
              {faqCategories.map((category) => (
                <div key={category.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h2 className="font-heading text-xl font-semibold">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`} className="border-border">
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium text-sm md:text-base">{item.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center p-8 bg-secondary rounded-xl">
              <h3 className="font-heading text-lg font-semibold mb-2">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Contactez-nous directement via WhatsApp pour une assistance rapide.
              </p>
              <a
                href="https://wa.me/213672536920?text=Salam%2C%20j'ai%20une%20question%20sur%20un%20produit%20sur%20BYTEK%20STORE."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Contacter via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}