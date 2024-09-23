'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
const SettingsForm = ({ form, onSubmit }: { form: any; onSubmit: any }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <Label>
              <Select name="model">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt2">Ruby</SelectItem>
                  <SelectItem value="gpt3">Emerald</SelectItem>
                  <SelectItem value="gpt4">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          )}
        />
        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperature - {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  defaultValue={[field.value]}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Controls the randomness of predictions; higher values (e.g.,
                1.0) increase diversity by making the model more likely to pick
                less probable words, while lower values (e.g., 0.1) make it more
                deterministic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxTokens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Tokens - {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={200}
                  max={1000}
                  step={50}
                  defaultValue={[field.value]}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Controls the maximum number of tokens generated.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topP"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Top P - {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  defaultValue={[field.value]}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Limits the model to the smallest set of most probable words
                whose combined probability adds up to a certain threshold (p),
                ensuring diversity while avoiding unlikely outputs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stream"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stream</FormLabel>
              <FormControl>
                <input type="checkbox" {...field} checked={field.value} />
              </FormControl>
              <FormDescription>
                Whether to stream the response from the model, or get the full
                response at once.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Run</Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingsForm
