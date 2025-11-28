import { FileText, Infinity, Code, Cpu, Users, Database } from "lucide-react"

export function FeaturesPanel() {
  const features = [
    {
      icon: FileText,
      label: "All File Extensions",
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      icon: Infinity,
      label: "No Size Limitation",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Code,
      label: "Open Source",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      link: "https://github.com/cypherfucker/SecureLock",
    },
    {
      icon: Cpu,
      label: "AES-256 Encryption",
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
    },
    {
      icon: Users,
      label: "Zero Data Collection",
      color: "text-red-500",
      bgColor: "bg-red-500/20",
    },
    {
      icon: Database,
      label: "No Server Storage",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/20",
    },
  ]

  return (
    <div className="border rounded-xl p-8 bg-card/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center gap-3">
            {feature.link ? (
              <a
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center transition-opacity hover:opacity-80`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </a>
            ) : (
              <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
            )}
            {feature.link ? (
              <a
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {feature.label}
              </a>
            ) : (
              <p className="text-sm font-medium">{feature.label}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
