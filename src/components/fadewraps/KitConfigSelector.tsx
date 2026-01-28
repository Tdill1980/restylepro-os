import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type KitSize = "small" | "medium" | "large" | "xl";
type RoofSize = "none" | "small" | "medium" | "large";

interface KitConfigSelectorProps {
  kitSize: KitSize;
  onKitSizeChange: (size: KitSize) => void;
  addHood: boolean;
  onAddHoodChange: (checked: boolean) => void;
  addFrontBumper: boolean;
  onAddFrontBumperChange: (checked: boolean) => void;
  addRearBumper: boolean;
  onAddRearBumperChange: (checked: boolean) => void;
  roofSize: RoofSize;
  onRoofSizeChange: (size: RoofSize) => void;
}

export const KitConfigSelector = ({
  kitSize,
  onKitSizeChange,
  addHood,
  onAddHoodChange,
  addFrontBumper,
  onAddFrontBumperChange,
  addRearBumper,
  onAddRearBumperChange,
  roofSize,
  onRoofSizeChange,
}: KitConfigSelectorProps) => {
  return (
    <div className="space-y-5">
      {/* Kit Size */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kit Size (sides only)</Label>
        <p className="text-xs text-muted-foreground">Base kit includes two sides</p>
        <Select value={kitSize} onValueChange={onKitSizeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Kit Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (150x59.5) - $600</SelectItem>
            <SelectItem value="medium">Medium (180x59.5) - $710</SelectItem>
            <SelectItem value="large">Large (210x59.5) - $825</SelectItem>
            <SelectItem value="xl">XL (240x59.5) - $990</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add-ons */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Additional Options</Label>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hood" 
              checked={addHood} 
              onCheckedChange={(checked) => onAddHoodChange(!!checked)} 
            />
            <label htmlFor="hood" className="text-sm cursor-pointer">
              Add Hood (72x59.5) - $160
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="frontBumper" 
              checked={addFrontBumper} 
              onCheckedChange={(checked) => onAddFrontBumperChange(!!checked)} 
            />
            <label htmlFor="frontBumper" className="text-sm cursor-pointer">
              Add Front Bumper (38x120.5) - $200
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rearBumper" 
              checked={addRearBumper} 
              onCheckedChange={(checked) => onAddRearBumperChange(!!checked)} 
            />
            <label htmlFor="rearBumper" className="text-sm cursor-pointer">
              Add Rear + Bumper (59x72.5, 38x120) - $395
            </label>
          </div>
        </div>
      </div>

      {/* Roof Options */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Roof Size</Label>
        <RadioGroup value={roofSize} onValueChange={onRoofSizeChange}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="roof-none" />
              <label htmlFor="roof-none" className="text-sm cursor-pointer">No Roof</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="roof-small" />
              <label htmlFor="roof-small" className="text-sm cursor-pointer">Small (72x59.5) - $160</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="roof-medium" />
              <label htmlFor="roof-medium" className="text-sm cursor-pointer">Medium (110x59.5) - $225</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="roof-large" />
              <label htmlFor="roof-large" className="text-sm cursor-pointer">Large (160x59.5) - $330</label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
