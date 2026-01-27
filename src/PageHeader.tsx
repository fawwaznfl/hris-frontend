interface PageHeaderProps {
  pageTitle: string;
  titleClass?: string;
  rightContent?: React.ReactNode; // untuk tombol-tombol di kanan
}

const PageHeader: React.FC<PageHeaderProps> = ({
  pageTitle,
  titleClass = "text-2xl",
  rightContent
}) => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm mb-6">
      
      {/* PAGE TITLE */}
      <h2 className={`${titleClass} font-semibold text-gray-800 dark:text-white`}>
        {pageTitle}
      </h2>

      {/* BUTTONS DI KANAN */}
      <div className="flex items-center gap-3">
        {rightContent}
      </div>
    </div>
  );
};

export default PageHeader;
