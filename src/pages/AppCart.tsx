import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAppCart } from '@/contexts/AppCartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AppCart = () => {
  const { items, removeItem, clearCart } = useAppCart();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: items[0].priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Checkout failed',
        description: 'Unable to create checkout session',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Your App Cart</h1>

          {items.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2 text-foreground">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add digital products, modules, or AI features to get started
              </p>
              <Button onClick={() => window.location.href = '/tools'}>
                Browse Tools
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Items List */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Items ({items.length})</h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.priceDisplay}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6 bg-card border-border">
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Checkout with Stripe
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppCart;
