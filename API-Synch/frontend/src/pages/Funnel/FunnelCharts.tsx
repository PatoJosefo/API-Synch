import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface Cliente {
    id: number;
    nome: string;
    funilId: number;
    valorVenda?: number | null;
    dataVenda?: string | null;
}

interface Estagio {
    id: number;
    estagioNome: string;
}

interface FunnelChartsProps {
    estagios: Estagio[];
    clientes: Cliente[];
}

export default function FunnelCharts({ estagios, clientes }: FunnelChartsProps) {
    // Color gradients for each bar
    const barColors = [
        { id: "gradient1", from: "#1e40af", to: "#3b82f6" }, // Dark Blue to Blue
        { id: "gradient2", from: "#8b5cf6", to: "#ec4899" }, // Purple to Pink
        { id: "gradient3", from: "#10b981", to: "#3b82f6" }, // Green to Blue
        { id: "gradient4", from: "#f59e0b", to: "#ef4444" }, // Orange to Red
        { id: "gradient5", from: "#6366f1", to: "#8b5cf6" }, // Indigo to Purple
    ];

    // Chart 1: Client count per stage
    const clientsPerStage = estagios.map((estagio, index) => ({
        name: estagio.estagioNome,
        clientes: clientes.filter((c) => c.funilId === estagio.id).length,
        fill: `url(#${barColors[index % barColors.length].id})`,
    }));

    // Chart 2: Sales over time
    const salesOverTime = clientes
        .filter((c) => c.dataVenda && c.valorVenda)
        .map((c) => ({
            data: new Date(c.dataVenda!).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            }),
            valor: Number(c.valorVenda),
            timestamp: new Date(c.dataVenda!).getTime(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .reduce((acc, curr) => {
            const existing = acc.find((item) => item.data === curr.data);
            if (existing) {
                existing.valor += curr.valor;
            } else {
                acc.push({ data: curr.data, valor: curr.valor });
            }
            return acc;
        }, [] as { data: string; valor: number }[]);

    // Chart 3: Sales by client (conditional per stage)
    const stagesWithSales = estagios
        .map((estagio) => {
            const clientesComVenda = clientes.filter(
                (c) => c.funilId === estagio.id && c.valorVenda
            );
            return {
                estagio,
                clientes: clientesComVenda.map((c) => ({
                    nome: c.nome,
                    valor: Number(c.valorVenda),
                })),
            };
        })
        .filter((stage) => stage.clientes.length > 0);

    return (
        <div className="w-full mt-12 space-y-8 px-4">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Análise de Vendas
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Clients per Stage */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Clientes por Estágio
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={clientsPerStage}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                }}
                            />
                            <Bar dataKey="clientes" radius={[8, 8, 0, 0]}>
                                {clientsPerStage.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#${barColors[index % barColors.length].id})`}
                                    />
                                ))}
                            </Bar>
                            <defs>
                                {barColors.map((color) => (
                                    <linearGradient
                                        key={color.id}
                                        id={color.id}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="0%" stopColor={color.from} stopOpacity={1} />
                                        <stop offset="100%" stopColor={color.to} stopOpacity={1} />
                                    </linearGradient>
                                ))}
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Sales Over Time */}
                {salesOverTime.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Valor de Vendas ao Longo do Tempo
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tickFormatter={(value) =>
                                        `R$ ${value.toLocaleString("pt-BR")}`
                                    }
                                />
                                <Tooltip
                                    formatter={(value: number) =>
                                        `R$ ${value.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                        })}`
                                    }
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke="#1e40af"
                                    fill="url(#colorValor)"
                                    strokeWidth={2}
                                />
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1e40af" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Chart 3: Sales by Client per Stage (Conditional) */}
            {stagesWithSales.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-700 text-center">
                        Vendas por Cliente (Estágios com Vendas Registradas)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {stagesWithSales.map(({ estagio, clientes: clientesComVenda }) => (
                            <div key={estagio.id} className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="text-md font-semibold text-gray-600 mb-4">
                                    {estagio.estagioNome}
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={clientesComVenda} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(value) =>
                                                `R$ ${value.toLocaleString("pt-BR")}`
                                            }
                                        />
                                        <YAxis
                                            dataKey="nome"
                                            type="category"
                                            width={120}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            formatter={(value: number) =>
                                                `R$ ${value.toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                })}`
                                            }
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #ddd",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                                            {clientesComVenda.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#${barColors[index % barColors.length].id})`}
                                                />
                                            ))}
                                        </Bar>
                                        <defs>
                                            {barColors.map((color) => (
                                                <linearGradient
                                                    key={color.id}
                                                    id={color.id}
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="0"
                                                >
                                                    <stop offset="0%" stopColor={color.from} stopOpacity={1} />
                                                    <stop offset="100%" stopColor={color.to} stopOpacity={1} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {salesOverTime.length === 0 && stagesWithSales.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <p className="text-yellow-700 font-medium">
                        📊 Nenhuma venda registrada ainda. Adicione valores e datas de venda aos
                        clientes para visualizar os gráficos de vendas.
                    </p>
                </div>
            )}
        </div>
    );
}
