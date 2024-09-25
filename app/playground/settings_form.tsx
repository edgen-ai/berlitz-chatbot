'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const SettingsForm = ({ form, onSubmit }: { form: any; onSubmit: any }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Model</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormDescription>
                Pick the model you want to use for generating completions. We
                have Ruby (7B), Emerald (13B), and Diamond (40B) models
                available.
              </FormDescription>
              <FormMessage />
            </FormItem>
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
          name="sysPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="w-full p-2 border border-gray-300 rounded bg-primary-foreground text-primary-background"
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                This is the prompt that will be used for the system.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seed</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-primary-foreground text-primary-background"
                />
              </FormControl>
              <FormDescription>
                The seed (integer) to use for random sampling. If not specified,
                we will use a random seed. Increases the possibility of
                deterministic outputs across calls, but not guaranteed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default SettingsForm
