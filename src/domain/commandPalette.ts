export type CommandSearchable = {
  label: string;
  hint?: string;
  keywords?: string[];
};

export function filterCommandActions<T extends CommandSearchable>(actions: T[], query: string): T[] {
  const normalized = query.trim().toLocaleLowerCase('ar');
  if (!normalized) return actions;
  return actions.filter((action) =>
    [action.label, action.hint ?? '', ...(action.keywords ?? [])]
      .join(' ')
      .toLocaleLowerCase('ar')
      .includes(normalized),
  );
}
