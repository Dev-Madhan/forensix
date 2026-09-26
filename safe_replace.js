const fs = require('fs');
const file = 'src/components/criminals/criminal-new-form.tsx';
let content = fs.readFileSync(file, 'utf8');

function replaceBlock(regex, replacement) {
    if (content.match(regex)) {
        content = content.replace(regex, replacement);
    }
}

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?render=\{[\s\S]*?Button[\s\S]*?\}\s*>\s*<span className="truncate">\{gender \|\| "Select gender"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?\{GENDER_OPTIONS\.map\(\(g\) => \(\s*<DropdownMenuItem[^>]*>\s*\{g\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={gender} placeholder="Select gender" options={GENDER_OPTIONS} onChange={(val) => { setGender(val); if (errors.gender) setErrors({ ...errors, gender: "" }); }} hasError={!!errors.gender} idPrefix="gender-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?render=\{[\s\S]*?Button[\s\S]*?\}\s*>\s*<span className="truncate">\{nationality \|\| "Select nationality"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?\{NATIONALITY_OPTIONS\.map\(\(n\) => \(\s*<DropdownMenuItem[^>]*>\s*\{n\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={nationality} placeholder="Select nationality" options={NATIONALITY_OPTIONS} onChange={(val) => { setNationality(val); if (errors.nationality) setErrors({ ...errors, nationality: "" }); }} hasError={!!errors.nationality} idPrefix="nationality-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{primaryCategory \|\| "Select primary category"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*\{CRIME_CATEGORIES\.map\(\(cat\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{cat\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={primaryCategory} placeholder="Select primary category" options={CRIME_CATEGORIES} onChange={(val) => { setPrimaryCategory(val); if (errors.primaryCategory) setErrors({ ...errors, primaryCategory: "" }); }} hasError={!!errors.primaryCategory} idPrefix="primarycat-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{secondaryCategory \|\| "Select secondary category"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{CRIME_CATEGORIES\.map\(\(cat\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{cat\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={secondaryCategory} placeholder="Select secondary category" options={CRIME_CATEGORIES} onChange={setSecondaryCategory} onClear={() => setSecondaryCategory("")} idPrefix="secondarycat-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span>\{riskLevel \|\| "Select risk level"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*\{RISK_LEVELS\.map\(\(level\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{level\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={riskLevel} placeholder="Select risk level" options={RISK_LEVELS} onChange={(val) => { setRiskLevel(val); if (errors.riskLevel) setErrors({ ...errors, riskLevel: "" }); }} hasError={!!errors.riskLevel} idPrefix="risklevel-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="flex items-center gap-2">\s*<span className="size-2 rounded-full[^>]*>\s*<\/span>\s*<span>\{status\}<\/span>\s*<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*\{STATUS_OPTIONS\.map\(\(opt\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*<span className=\{cn\("size-2 rounded-full", opt\.color\)\} \/>\s*<span>\{opt\.label\}<\/span>\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedStatusSelect value={status} options={STATUS_OPTIONS} onChange={(val) => { setStatus(val); if (errors.status) setErrors({ ...errors, status: "" }); }} idPrefix="status-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{eyeColor \|\| "Select eye color"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{EYE_COLORS\.map\(\(color\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{color\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={eyeColor} placeholder="Select eye color" options={EYE_COLORS} onChange={setEyeColor} onClear={() => setEyeColor("")} idPrefix="eyecolor-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{hairColor \|\| "Select hair color"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{HAIR_COLORS\.map\(\(color\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{color\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={hairColor} placeholder="Select hair color" options={HAIR_COLORS} onChange={setHairColor} onClear={() => setHairColor("")} idPrefix="haircolor-dd" />'
);

replaceBlock(
    /<DropdownMenu>\s*<DropdownMenuTrigger[\s\S]*?>\s*<span className="truncate">\{build \|\| "Select build type"\}<\/span>\s*<ChevronDown[\s\S]*?>\s*<\/DropdownMenuTrigger>\s*<DropdownMenuContent[\s\S]*?>\s*<DropdownMenuItem[\s\S]*?>\s*None\s*<\/DropdownMenuItem>\s*\{BUILD_OPTIONS\.map\(\(b\) => \(\s*<DropdownMenuItem[\s\S]*?>\s*\{b\}\s*<\/DropdownMenuItem>\s*\)\)\}\s*<\/DropdownMenuContent>\s*<\/DropdownMenu>/,
    '<AnimatedSelect value={build} placeholder="Select build type" options={BUILD_OPTIONS} onChange={setBuild} onClear={() => setBuild("")} idPrefix="build-dd" />'
);

fs.writeFileSync(file, content);
console.log('Update complete!');
