import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { categoryOptions } from "@/constants/enums"
import { ContentCategory, Visibility } from "@/generated/prisma/enums"

type TitleMetadataConfig = {
  type: "title"
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

type DescriptionMetadataConfig = {
  type: "description"
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

type CategoryMetadataConfig = {
  type: "category"
  placeholder?: string
  value: string
  onChange: (value: ContentCategory) => void
}

type VisibilityMetadataConfig = {
  type: "visibility"
  value: string
  onChange: (value: Visibility) => void
}

type MetadataConfig =
  | TitleMetadataConfig
  | DescriptionMetadataConfig
  | CategoryMetadataConfig
  | VisibilityMetadataConfig

function InputMetadata({
  metadatas,
  forUpdate = false
}: {
  metadatas: MetadataConfig[]
  forUpdate?: boolean
}) {
  const titleMetadata = metadatas.find((m) => m.type === "title") as TitleMetadataConfig | undefined
  const descriptionMetadata = metadatas.find((m) => m.type === "description") as DescriptionMetadataConfig | undefined
  const categoryMetadata = metadatas.find((m) => m.type === "category") as CategoryMetadataConfig | undefined
  const visibilityMetadata = metadatas.find((m) => m.type === "visibility") as VisibilityMetadataConfig | undefined
  
  return (
    <div className="flex flex-col gap-4">
      {titleMetadata && <InputMetadataTitle
        value={titleMetadata.value}
        onChange={titleMetadata.onChange}
        placeholder={titleMetadata.placeholder}
      />}

      {descriptionMetadata && <InputMetadataDescription
        value={descriptionMetadata.value}
        onChange={descriptionMetadata.onChange}
        placeholder={descriptionMetadata.placeholder}
      />}

      <div className="grid grid-cols-2 gap-4">
        {categoryMetadata && <InputMetadataCategory
          value={categoryMetadata.value}
          onChange={categoryMetadata.onChange}
          placeholder={categoryMetadata.placeholder}
        />}

        {visibilityMetadata && <InputMetadataVisibility
          value={visibilityMetadata.value}
          onChange={visibilityMetadata.onChange}
          forUpdate={forUpdate}
        />}
      </div>
    </div>
  )
}

function InputMetadataTitle({
  value,
  onChange,
  placeholder = "Untitled",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="title" className="ml-1">
        Title <strong className="text-red-500">*</strong>
      </Label>
      <Input
        id="title"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function InputMetadataDescription({
  value,
  onChange,
  placeholder = "Description",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="desc" className="ml-1">Description</Label>
      <Textarea
        id="desc"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function InputMetadataCategory({
  value,
  onChange,
  placeholder = "Category"
}: {
  value: string,
  onChange: (value: ContentCategory) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="ml-1">Category:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {categoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function InputMetadataVisibility({
  value,
  onChange,
  forUpdate = false
}: {
  value: string
  onChange: (value: Visibility) => void
  forUpdate: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="vis" className="ml-1">Visibility:</Label>
      <RadioGroup
        id="vis"
        value={value}
        onValueChange={onChange}
        className="flex flex-1 justify-between"
      >
        <Label className="flex flex-1 items-center gap-2 border p-2 rounded-md shadow-xs cursor-pointer">
          <RadioGroupItem value="private" disabled={forUpdate} />
          Private
        </Label>

        <Label className="flex flex-1 items-center gap-2 border p-2 rounded-md shadow-xs cursor-pointer">
          <RadioGroupItem value="public"/>
          Public
        </Label>
      </RadioGroup>
    </div>
  )
}

export { InputMetadata }
export type {
  MetadataConfig,
  TitleMetadataConfig,
  DescriptionMetadataConfig,
  CategoryMetadataConfig,
  VisibilityMetadataConfig,
}