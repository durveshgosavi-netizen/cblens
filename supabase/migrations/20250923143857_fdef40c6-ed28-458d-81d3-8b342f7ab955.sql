-- Allow users to delete their own scans
CREATE POLICY "Users can delete their own scans" 
ON public.scans 
FOR DELETE 
USING (auth.uid() = user_id);