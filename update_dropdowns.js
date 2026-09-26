const fs = require('fs');

const file_path = 'src/components/criminals/criminal-new-form.tsx';
let content = fs.readFileSync(file_path, 'utf-8');

const helper_components = `
function AnimatedSelect({
  value,
  placeholder,
  options,
  onChange,
  onClear,
  hasError,
  idPrefix,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onChange: (val: string) => void;
  onClear?: () => void;
  hasError?: boolean;
  idPrefix: string;
}) {
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center",
              hasError && "border-rose-500/80 focus-visible:border-rose-500"
            )}
          />
        }
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-(--anchor-width) min-w-[200px] max-h-[300px] p-1.5 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onPointerLeave={() => setHoveredItem(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          {onClear && (
            <DropdownMenuItem
              onClick={onClear}
              onPointerEnter={() => setHoveredItem("clear")}
              className="relative z-0 cursor-pointer px-2 py-1.5 rounded-md transition-colors text-xs text-muted-foreground hover:!bg-transparent focus:!bg-transparent"
            >
              {hoveredItem === "clear" && (
                <motion.div
                  layoutId={\`\${idPrefix}-hover\`}
                  className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              None
            </DropdownMenuItem>
          )}
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              onPointerEnter={() => setHoveredItem(opt)}
              className="relative z-0 cursor-pointer px-2 py-1.5 rounded-md transition-colors font-medium text-sm text-foreground/90 hover:!bg-transparent focus:!bg-transparent"
            >
              {hoveredItem === opt && (
                <motion.div
                  layoutId={\`\${idPrefix}-hover\`}
                  className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              {opt}
            </DropdownMenuItem>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AnimatedStatusSelect({
  value,
  options,
  onChange,
  idPrefix,
}: {
  value: string;
  options: typeof STATUS_OPTIONS;
  onChange: (val: string) => void;
  idPrefix: string;
}) {
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const selectedOption = options.find(o => o.label === value) || options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
          />
        }
      >
        <span className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", selectedOption?.color || "bg-emerald-400")} />
          <span>{value}</span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-(--anchor-width) min-w-[200px] max-h-[300px] p-1.5 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onPointerLeave={() => setHoveredItem(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.label}
              onClick={() => onChange(opt.label)}
              onPointerEnter={() => setHoveredItem(opt.label)}
              className="relative z-0 cursor-pointer px-2 py-1.5 rounded-md transition-colors font-medium text-sm text-foreground/90 hover:!bg-transparent focus:!bg-transparent flex items-center gap-2"
            >
              {hoveredItem === opt.label && (
                <motion.div
                  layoutId={\`\${idPrefix}-hover\`}
                  className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              <span className={cn("size-2 rounded-full", opt.color)} />
              {opt.label}
            </DropdownMenuItem>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;

const header_idx = content.indexOf('export function CriminalNewForm(');
content = content.substring(0, header_idx) + helper_components + '\n' + content.substring(header_idx);

// Helper for generic replacements
const genderRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?render=\{[\s\S]*?Button[\s\S]*?\}\s*>\s*<span className="truncate">\{gender \|\| "Select gender"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*\{GENDER_OPTIONS\.map\(\(g\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{g\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(genderRegex, '<AnimatedSelect value={gender} placeholder="Select gender" options={GENDER_OPTIONS} onChange={(val) => { setGender(val); if (errors.gender) setErrors({ ...errors, gender: "" }); }} hasError={!!errors.gender} idPrefix="gender-dd" />');

const nationalityRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?render=\{[\s\S]*?Button[\s\S]*?\}\s*>\s*<span className="truncate">\{nationality \|\| "Select nationality"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*\{NATIONALITY_OPTIONS\.map\(\(n\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{n\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(nationalityRegex, '<AnimatedSelect value={nationality} placeholder="Select nationality" options={NATIONALITY_OPTIONS} onChange={(val) => { setNationality(val); if (errors.nationality) setErrors({ ...errors, nationality: "" }); }} hasError={!!errors.nationality} idPrefix="nationality-dd" />');

const primaryCategoryRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{primaryCategory \|\| "Select primary category"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*\{CRIME_CATEGORIES\.map\(\(cat\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{cat\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(primaryCategoryRegex, '<AnimatedSelect value={primaryCategory} placeholder="Select primary category" options={CRIME_CATEGORIES} onChange={(val) => { setPrimaryCategory(val); if (errors.primaryCategory) setErrors({ ...errors, primaryCategory: "" }); }} hasError={!!errors.primaryCategory} idPrefix="primarycat-dd" />');

const secondaryCategoryRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{secondaryCategory \|\| "Select secondary category"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{CRIME_CATEGORIES\.map\(\(cat\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{cat\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(secondaryCategoryRegex, '<AnimatedSelect value={secondaryCategory} placeholder="Select secondary category" options={CRIME_CATEGORIES} onChange={setSecondaryCategory} onClear={() => setSecondaryCategory("")} idPrefix="secondarycat-dd" />');

const riskLevelRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span>\{riskLevel \|\| "Select risk level"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*\{RISK_LEVELS\.map\(\(level\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{level\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(riskLevelRegex, '<AnimatedSelect value={riskLevel} placeholder="Select risk level" options={RISK_LEVELS} onChange={(val) => { setRiskLevel(val); if (errors.riskLevel) setErrors({ ...errors, riskLevel: "" }); }} hasError={!!errors.riskLevel} idPrefix="risklevel-dd" />');

const statusRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="flex items-center gap-2">\s*<span className="size-2 rounded-full bg-[^"]+" \/>\s*<span>\{status\}<\/span>\s*<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*\{STATUS_OPTIONS\.map\(\(opt\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*<span className=\{cn\("size-2 rounded-full", opt\.color\)\} \/>\s*<span>\{opt\.label\}<\/span>\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(statusRegex, '<AnimatedStatusSelect value={status} options={STATUS_OPTIONS} onChange={(val) => { setStatus(val); if (errors.status) setErrors({ ...errors, status: "" }); }} idPrefix="status-dd" />');

const eyeColorRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{eyeColor \|\| "Select eye color"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{EYE_COLORS\.map\(\(color\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{color\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(eyeColorRegex, '<AnimatedSelect value={eyeColor} placeholder="Select eye color" options={EYE_COLORS} onChange={setEyeColor} onClear={() => setEyeColor("")} idPrefix="eyecolor-dd" />');

const hairColorRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{hairColor \|\| "Select hair color"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{HAIR_COLORS\.map\(\(color\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{color\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(hairColorRegex, '<AnimatedSelect value={hairColor} placeholder="Select hair color" options={HAIR_COLORS} onChange={setHairColor} onClear={() => setHairColor("")} idPrefix="haircolor-dd" />');

const buildRegex = /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{build \|\| "Select build type"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<motion\.div[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{BUILD_OPTIONS\.map\(\(b\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{b\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/motion\.div>\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/m;
content = content.replace(buildRegex, '<AnimatedSelect value={build} placeholder="Select build type" options={BUILD_OPTIONS} onChange={setBuild} onClear={() => setBuild("")} idPrefix="build-dd" />');

fs.writeFileSync(file_path, content);
console.log('Update complete!');
