
  // Check subscription status
  const checkSubscription = async () => {
    if (!session?.access_token) return;
    
    try {
      // Call our edge function to check subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.subscription) {
        setSubscription({
          markus: !!data.subscription.markus,
          kara: !!data.subscription.kara,
          connor: !!data.subscription.connor,
          chloe: !!data.subscription.chloe,
          allInOne: !!data.subscription.all_in_one,
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };
